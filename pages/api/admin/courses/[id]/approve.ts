import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/authOptions';
import connectDB from '../../../../../lib/mongodb';
import Course from '../../../../../models/Course';
import '../../../../../models';
import { PERMISSIONS, hasPermission } from '../../../../../lib/permissions';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'ID de la formation requis' });
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    // Vérifier l'authentification
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    // Vérifier les permissions
    const userRole = session.user.role;
    if (!userRole || !hasPermission(userRole.permissions, PERMISSIONS.COURSE_UPDATE)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const { action } = req.body; // 'approve' ou 'reject'

    // Récupérer l'utilisateur pour obtenir son ID
    const User = (await import('../../../../models/User')).default;
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const updateData: any = {};
    if (action === 'approve') {
      updateData.isApproved = true;
      updateData.approvedBy = user._id;
      updateData.approvedAt = new Date();
    } else if (action === 'reject') {
      updateData.isApproved = false;
      updateData.isPublished = false;
    } else {
      return res.status(400).json({ message: 'Action invalide. Utilisez "approve" ou "reject"' });
    }

    const course = await Course.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate('instructor', 'firstName lastName email');

    if (!course) {
      return res.status(404).json({ message: 'Formation non trouvée' });
    }

    return res.status(200).json({
      message: action === 'approve' ? 'Formation approuvée avec succès' : 'Formation rejetée',
      course,
    });
  } catch (error: any) {
    console.error('Error updating course:', error);
    return res.status(500).json({ message: 'Erreur lors de la mise à jour de la formation' });
  }
}

export default handler;

