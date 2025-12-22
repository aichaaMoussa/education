import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/authOptions';
import connectDB from '../../../lib/mongodb';
import Course from '../../../models/Course';
import User from '../../../models/User';
import '../../../models';

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

    await connectDB();

    // Récupérer l'utilisateur pour obtenir son ID
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier que l'utilisateur est un formateur
    const userRole = session.user.role?.name;
    if (userRole !== 'formateur' && userRole !== 'instructor' && userRole !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé. Vous devez être formateur.' });
    }

    // Récupérer les formations créées par ce formateur
    const courses = await Course.find({ instructor: user._id })
      .sort({ createdAt: -1 });

    return res.status(200).json(courses);
  } catch (error: any) {
    console.error('Error fetching formateur courses:', error);
    return res.status(500).json({ 
      message: 'Erreur lors de la récupération des formations',
      error: error.message 
    });
  }
}

