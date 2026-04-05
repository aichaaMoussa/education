import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/authOptions';
import connectDB from '../../../../lib/mongodb';
import Course from '../../../../models/Course';
import '../../../../models';
import { PERMISSIONS, hasPermission } from '../../../../lib/permissions';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    // Vérifier l'authentification
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    // Vérifier que l'utilisateur est un admin
    const userRoleName = session.user.role?.name;
    if (userRoleName !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé. Seuls les administrateurs peuvent accéder à cette ressource.' });
    }

    await connectDB();

    console.log('Fetching pending courses...');
    
    // Récupérer les formations en attente d'approbation
    const courses = await Course.find({
      isApproved: false,
      isPublished: true,
    })
      .populate('instructor', 'firstName lastName email')
      .sort({ createdAt: -1 });

    console.log(`Found ${courses.length} pending courses`);

    return res.status(200).json(courses);
  } catch (error: any) {
    console.error('Error fetching pending courses:', error);
    return res.status(500).json({ 
      message: 'Erreur lors de la récupération des formations',
      error: error.message 
    });
  }
}

export default handler;
