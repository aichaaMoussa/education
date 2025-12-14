import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]';
import connectDB from '../../../../lib/mongodb';
import Course from '../../../../models/Course';
import '../../../../models';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Vérifier l'authentification
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    // Vérifier les permissions (admin ou formateur)
    const userRole = session.user.role?.name;
    if (userRole !== 'admin' && userRole !== 'formateur' && userRole !== 'instructor') {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    await connectDB();

    const { title, category, price, description, level, resources } = req.body;

    // Validation
    if (!title || !category || price === undefined || !description || !level) {
      return res.status(400).json({ 
        message: 'Tous les champs sont requis (title, category, price, description, level)' 
      });
    }

    // Créer le cours
    // Note: L'instructor sera l'utilisateur connecté
    // Pour obtenir l'ID de l'utilisateur, on doit le récupérer depuis la session
    // On va utiliser l'email pour trouver l'utilisateur
    const User = (await import('../../../../models/User')).default;
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const courseData = {
      title,
      category,
      price: parseFloat(price),
      description,
      level,
      instructor: user._id,
      resources: {
        pdfs: resources?.pdfs || [],
        videos: resources?.videos || [],
        quizzes: resources?.quizzes || [],
      },
      isPublished: true, // Publier le cours pour qu'il apparaisse dans la liste d'attente
      isApproved: userRole === 'admin', // Les admins peuvent créer des cours approuvés directement
      duration: 0, // Par défaut, peut être calculé plus tard
    };

    console.log('Creating course with data:', {
      title,
      category,
      price: parseFloat(price),
      instructor: user._id,
      isPublished: courseData.isPublished,
      isApproved: courseData.isApproved,
    });

    const course = await Course.create(courseData);

    console.log('Course created successfully:', course._id);

    return res.status(201).json({
      message: 'Cours créé avec succès',
      course: {
        id: course._id,
        title: course.title,
        category: course.category,
        price: course.price,
        isPublished: course.isPublished,
        isApproved: course.isApproved,
      },
    });
  } catch (error: any) {
    console.error('Error creating course:', error);
    return res.status(500).json({ 
      message: 'Erreur lors de la création du cours',
      error: error.message 
    });
  }
}

