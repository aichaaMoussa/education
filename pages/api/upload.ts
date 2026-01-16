import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../lib/authOptions';
import { uploadObject } from '../../lib/storage';
import StorageObject from '../../models/StorageObject';
import '../../models';
import connectDB from '../../lib/mongodb';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '500mb',
    },
  },
};

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

    const { file, fileName, fileType } = req.body;

    if (!file || !fileName || !fileType) {
      return res.status(400).json({
        message: 'Fichier, fileName et fileType sont requis',
      });
    }

    const allowedTypes = ['pdf', 'video', 'image'];
    if (!allowedTypes.includes(fileType)) {
      return res.status(400).json({
        message: `Type de fichier invalide. Utilisez: ${allowedTypes.join(', ')}`,
      });
    }

    const fileBuffer = Buffer.from(file, 'base64');

    let mimeType = 'application/octet-stream';
    if (fileType === 'pdf') {
      mimeType = 'application/pdf';
    } else if (fileType === 'video') {
      const ext = fileName.toLowerCase();
      if (ext.endsWith('.mp4')) mimeType = 'video/mp4';
      else if (ext.endsWith('.mov')) mimeType = 'video/quicktime';
      else if (ext.endsWith('.avi')) mimeType = 'video/x-msvideo';
      else mimeType = 'video/mp4';
    } else if (fileType === 'image') {
      const ext = fileName.toLowerCase();
      if (ext.endsWith('.jpg') || ext.endsWith('.jpeg')) mimeType = 'image/jpeg';
      else if (ext.endsWith('.png')) mimeType = 'image/png';
      else if (ext.endsWith('.gif')) mimeType = 'image/gif';
      else if (ext.endsWith('.webp')) mimeType = 'image/webp';
      else mimeType = 'image/jpeg';
    }

    const bucket = fileType === 'image' ? 'images' : fileType === 'video' ? 'videos' : 'documents';
    const storageObject = await uploadObject(bucket, fileBuffer, fileName, mimeType);

    const dbRecord = await StorageObject.create({
      bucket: storageObject.bucket,
      key: storageObject.key,
      url: storageObject.url,
      mimeType,
      size: fileBuffer.length,
      originalFilename: fileName,
      uploadedBy: (session.user as any).id,
    });

    return res.status(200).json({
      url: storageObject.url,
      fileName: fileName,
      filePath: storageObject.key,
      id: dbRecord._id,
    });
  } catch (error: any) {
    console.error('Upload API error:', error);
    return res.status(500).json({
      message: 'Erreur lors de l\'upload du fichier',
      error: error.message,
    });
  }
}
