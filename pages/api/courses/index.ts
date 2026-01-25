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
    // Si le paramètre 'all' est présent, retourner toutes les formations sans limite
    const limit = req.query.all === 'true' ? undefined : 12;
    const query = Course.find({
      isApproved: true,
      isPublished: true,
    })
      .populate('instructor', 'firstName lastName email')
      .populate('students', '_id')
      .select('-lessons')
      .sort({ createdAt: -1 });
    
    if (limit) {
      query.limit(limit);
    }
    
    const courses = await query;

    return res.status(200).json(courses);
  } catch (error: any) {
    console.error('Error fetching courses:', error);
    return res.status(500).json({ 
      message: 'Erreur lors de la récupération des formations',
      error: error.message 
    });
  }
}

