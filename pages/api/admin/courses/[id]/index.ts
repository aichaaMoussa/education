import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import '@/models';
import { PERMISSIONS, hasPermission } from '@/lib/permissions';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    await connectDB();

    // Vérifier l'authentification
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    // Vérifier les permissions
    const userRole = session.user.role;
    if (!userRole || !hasPermission(userRole.permissions, PERMISSIONS.COURSE_READ)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'ID de la formation requis' });
    }

    // Récupérer la formation avec toutes les informations
    const course = await Course.findById(id)
      .populate('instructor', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email');

    if (!course) {
      return res.status(404).json({ message: 'Formation non trouvée' });
    }

    return res.status(200).json(course);
  } catch (error: any) {
    console.error('Error fetching course:', error);
    return res.status(500).json({ 
      message: 'Erreur lors de la récupération de la formation',
      error: error.message 
    });
  }
}

export default handler;

