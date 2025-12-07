import type { NextApiRequest, NextApiResponse } from 'next';
// Import models first to ensure they are registered
import '../../../../models';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';
import Role from '../../../../models/Role';
import { withPermission, AuthenticatedRequest } from '../../../../lib/middleware';
import { PERMISSIONS } from '../../../../lib/permissions';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const users = await User.find()
        .select('-password -__v')
        .populate('role', 'name permissions')
        .sort({ createdAt: -1 });
      
      return res.status(200).json(users);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { email, password, firstName, lastName, roleId, isActive = true } = req.body;

      if (!email || !password || !firstName || !lastName || !roleId) {
        return res.status(400).json({ 
          message: 'Tous les champs sont requis (email, password, firstName, lastName, roleId)' 
        });
      }

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }

      // Vérifier si le rôle existe
      const role = await Role.findById(roleId);
      if (!role) {
        return res.status(400).json({ message: 'Rôle non trouvé' });
      }

      // Hash du mot de passe
      const { hashPassword } = await import('../../../../lib/auth');
      const hashedPassword = await hashPassword(password);

      const user = await User.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: roleId,
        isActive,
      });

      const userResponse = await User.findById(user._id)
        .select('-password -__v')
        .populate('role', 'name permissions');

      return res.status(201).json({
        message: 'Utilisateur créé avec succès',
        user: userResponse,
      });
    } catch (error: any) {
      console.error('Error creating user:', error);
      return res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur' });
    }
  }

  return res.status(405).json({ message: 'Méthode non autorisée' });
}

export default async function(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return withPermission(PERMISSIONS.USER_READ, handler)(req, res);
  } else if (req.method === 'POST') {
    return withPermission(PERMISSIONS.USER_CREATE, handler)(req, res);
  } else {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }
}

