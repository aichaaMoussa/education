import type { NextApiRequest, NextApiResponse } from 'next';
// Import models first
//import '@models';

//import connectDB from '../../../lib/mongodb';
import Course from '@models/Course';



async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    // Récupérer les formations en attente d'approbation
    const courses = await Course.find({
      isApproved: false,
      isPublished: true,
    })
      .populate('instructor', 'firstName lastName email')
      .sort({ createdAt: -1 });

    return res.status(200).json(courses);
  } catch (error: any) {
    console.error('Error fetching pending courses:', error);
    return res.status(500).json({ message: 'Erreur lors de la récupération des formations' });
  }
}

export default handler;


