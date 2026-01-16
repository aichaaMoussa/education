import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/authOptions';
import { uploadObject } from '../../../lib/storage';
import StorageObject from '../../../models/StorageObject';
import '../../../models';
import connectDB from '../../../lib/mongodb';
import { IncomingForm, File as FormidableFile } from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'application/pdf',
];

function parseMultipart(req: NextApiRequest): Promise<{
  fields: { [key: string]: string[] };
  files: { [key: string]: { fieldName: string; originalFilename: string; path: string; size: number; headers: any }[] };
}> {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      maxFileSize: parseInt(process.env.MAX_UPLOAD_SIZE || '104857600', 10),
      keepExtensions: true,
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }
      
      const parsedFields: { [key: string]: string[] } = {};
      const parsedFiles: { [key: string]: any[] } = {};

      Object.keys(fields).forEach(key => {
        const value = fields[key];
        parsedFields[key] = Array.isArray(value) ? value : (value !== undefined ? [value] : []);
      });

      Object.keys(files).forEach(key => {
        const fileValue = files[key];
        const fileArray = Array.isArray(fileValue) ? fileValue : [fileValue];
        parsedFiles[key] = fileArray.map((file: FormidableFile) => ({
          fieldName: key,
          originalFilename: file.originalFilename || 'unknown',
          path: file.filepath,
          size: file.size || 0,
          headers: { 'content-type': file.mimetype || 'application/octet-stream' },
        }));
      });

      resolve({ fields: parsedFields, files: parsedFiles });
    });
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    await connectDB();

    const { fields, files } = await parseMultipart(req);
    const fileField = files.file?.[0];

    if (!fileField) {
      return res.status(400).json({ message: 'Aucun fichier fourni' });
    }

    const bucket = (fields.bucket?.[0] || 'default').trim();
    const originalFilename = fileField.originalFilename || 'unknown';
    const mimeType = fileField.headers['content-type'] || 'application/octet-stream';

    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return res.status(400).json({
        message: `Type de fichier non autorisé: ${mimeType}`,
      });
    }

    const { promises: fs } = await import('fs');
    const fileBuffer = await fs.readFile(fileField.path);
    await fs.unlink(fileField.path);

    const storageObject = await uploadObject(
      bucket,
      fileBuffer,
      originalFilename,
      mimeType
    );

    const dbRecord = await StorageObject.create({
      bucket: storageObject.bucket,
      key: storageObject.key,
      url: storageObject.url,
      mimeType,
      size: fileBuffer.length,
      originalFilename,
      uploadedBy: (session.user as any).id,
    });

    return res.status(200).json({
      id: dbRecord._id,
      bucket: storageObject.bucket,
      key: storageObject.key,
      url: storageObject.url,
      mimeType,
      size: fileBuffer.length,
      originalFilename,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({
      message: 'Erreur lors de l\'upload du fichier',
      error: error.message,
    });
  }
}

