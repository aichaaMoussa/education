import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/authOptions';
import connectDB from '../../../../lib/mongodb';
import Course from '../../../../models/Course';
import '../../../../models';
import { PERMISSIONS, hasPermission } from '../../../../lib/permissions';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
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

    await connectDB();

    // Récupérer toutes les formations
    const courses = await Course.find({})
      .populate('instructor', 'firstName lastName email')
      .sort({ createdAt: -1 });

    return res.status(200).json(courses);
  } catch (error: any) {
    console.error('Error fetching all courses:', error);
    return res.status(500).json({ 
      message: 'Erreur lors de la récupération des formations',
      error: error.message 
    });
  }
}

