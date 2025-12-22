import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Role from '@/models/Role';
import '@/models';
import { PERMISSIONS, hasPermission } from '@/lib/permissions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    await connectDB();

    // Vérifier l'authentification
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    // Vérifier les permissions
    const user = await User.findOne({ email: session.user.email }).populate('role');
    if (!user || !user.role) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const userPermissions = (user.role as any).permissions || [];
    if (!hasPermission(userPermissions, PERMISSIONS.USER_READ)) {
      return res.status(403).json({ message: 'Permissions insuffisantes' });
    }

    // Récupérer le rôle formateur
    const formateurRole = await Role.findOne({
      $or: [
        { name: 'formateur' },
        { name: 'instructor' }
      ]
    });

    if (!formateurRole) {
      return res.status(200).json([]);
    }

    // Récupérer tous les utilisateurs avec le rôle formateur
    const formateurs = await User.find({ role: formateurRole._id })
      .select('-password -__v')
      .populate('role', 'name permissions')
      .sort({ createdAt: -1 });

    return res.status(200).json(formateurs);
  } catch (error: any) {
    console.error('Error fetching formateurs:', error);
    return res.status(500).json({ message: 'Erreur lors de la récupération des formateurs' });
  }
}

