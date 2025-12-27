import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import '@/models';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    await connectDB();

    // Récupérer uniquement les formations approuvées et publiées (publique)
    const courses = await Course.find({
      isApproved: true,
      isPublished: true,
    })
      .populate('instructor', 'firstName lastName email')
      .select('-lessons -students')
      .sort({ createdAt: -1 })
      .limit(12); // Limiter à 12 formations pour la page d'accueil

    return res.status(200).json(courses);
  } catch (error: any) {
    console.error('Error fetching courses:', error);
    return res.status(500).json({ 
      message: 'Erreur lors de la récupération des formations',
      error: error.message 
    });
  }
}

