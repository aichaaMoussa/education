import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/authOptions';
import { deleteObject } from '../../../lib/storage';
import StorageObject from '../../../models/StorageObject';
import '../../../models';
import connectDB from '../../../lib/mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    await connectDB();

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'ID requis' });
    }

    const dbRecord = await StorageObject.findById(id);

    if (!dbRecord) {
      return res.status(404).json({ message: 'Fichier non trouvé' });
    }

    await deleteObject(dbRecord.bucket, dbRecord.key);
    await StorageObject.findByIdAndDelete(id);

    return res.status(200).json({ message: 'Fichier supprimé avec succès' });
  } catch (error: any) {
    console.error('Delete error:', error);
    return res.status(500).json({
      message: 'Erreur lors de la suppression du fichier',
      error: error.message,
    });
  }
}

