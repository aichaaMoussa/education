import type { NextApiRequest, NextApiResponse } from 'next';
// Import models first
//import '@models';
import connectDB from '@lib/mongodb';
import Course from '@models/Course';
import { withPermission, AuthenticatedRequest } from '@lib/middleware';
import { PERMISSIONS } from '@lib/permissions';


async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  await connectDB();
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'ID de la formation requis' });
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    const { action } = req.body; // 'approve' ou 'reject'

    if (!req.user) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    const updateData: any = {};
    if (action === 'approve') {
      updateData.isApproved = true;
      updateData.approvedBy = req.user.id;
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

export default withPermission(PERMISSIONS.COURSE_UPDATE, handler);

