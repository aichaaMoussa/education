import type { NextApiRequest, NextApiResponse } from 'next';
// Import models first
import '../../../models';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import Course from '../../../models/Course';
import Enrollment from '../../../models/Enrollment';
import { withPermission, AuthenticatedRequest } from '../../../lib/middleware';
import { PERMISSIONS } from '../../../lib/permissions';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    // Compter les formateurs
    const Role = (await import('../../../models/Role')).default;
    const formateursRole = await Role.findOne({ 
      $or: [{ name: 'formateur' }, { name: 'instructor' }] 
    });
    const totalFormateurs = formateursRole 
      ? await User.countDocuments({ role: formateursRole._id })
      : 0;

    // Compter les apprenants
    const apprenantsRole = await Role.findOne({ 
      $or: [{ name: 'apprenant' }, { name: 'student' }] 
    });
    const totalApprenants = apprenantsRole 
      ? await User.countDocuments({ role: apprenantsRole._id })
      : 0;

    // Compter les formations
    const totalFormations = await Course.countDocuments();
    const formationsApprouvees = await Course.countDocuments({ isApproved: true });
    const formationsEnAttente = await Course.countDocuments({ isApproved: false, isPublished: true });

    // Calculer les revenus et inscriptions
    const enrollments = await Enrollment.find();
    const revenusTotal = enrollments.reduce((sum, e) => sum + (e.pricePaid || 0), 0);
    const inscriptionsTotal = enrollments.length;

    return res.status(200).json({
      totalFormateurs,
      totalApprenants,
      totalFormations,
      formationsApprouvees,
      formationsEnAttente,
      revenusTotal,
      inscriptionsTotal,
    });
  } catch (error: any) {
    console.error('Error fetching statistics:', error);
    return res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
  }
}

export default withPermission(PERMISSIONS.DASHBOARD_ADMIN, handler);

