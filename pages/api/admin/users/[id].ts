import type { NextApiRequest, NextApiResponse } from 'next';
// Import models first to ensure they are registered
import '../../../../models';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';
import Role from '../../../../models/Role';
import { withPermission, AuthenticatedRequest } from '../../../../lib/middleware';
import { PERMISSIONS } from '../../../../lib/permissions';
import { hashPassword } from '../../../../lib/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  await connectDB();
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'ID de l\'utilisateur requis' });
  }

  if (req.method === 'GET') {
    try {
      const user = await User.findById(id)
        .select('-password -__v')
        .populate('role', 'name permissions');
      
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }
      return res.status(200).json(user);
    } catch (error: any) {
      console.error('Error fetching user:', error);
      return res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { email, firstName, lastName, roleId, isActive, password } = req.body;

      const updateData: any = {};
      
      if (email) updateData.email = email;
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (isActive !== undefined) updateData.isActive = isActive;
      if (password) {
        updateData.password = await hashPassword(password);
      }
      if (roleId) {
        // Vérifier si le rôle existe
        const role = await Role.findById(roleId);
        if (!role) {
          return res.status(400).json({ message: 'Rôle non trouvé' });
        }
        updateData.role = roleId;
      }

      const user = await User.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      )
        .select('-password -__v')
        .populate('role', 'name permissions');

      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      return res.status(200).json({
        message: 'Utilisateur mis à jour avec succès',
        user,
      });
    } catch (error: any) {
      console.error('Error updating user:', error);
      if (error.code === 11000) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }
      return res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'utilisateur' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Empêcher la suppression de son propre compte
      if (req.user && req.user.id === id) {
        return res.status(400).json({ 
          message: 'Vous ne pouvez pas supprimer votre propre compte' 
        });
      }

      const user = await User.findByIdAndDelete(id);
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      return res.status(200).json({
        message: 'Utilisateur supprimé avec succès',
      });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      return res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur' });
    }
  }

  return res.status(405).json({ message: 'Méthode non autorisée' });
}

export default async function(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return withPermission(PERMISSIONS.USER_READ, handler)(req, res);
  } else if (req.method === 'PUT') {
    return withPermission(PERMISSIONS.USER_UPDATE, handler)(req, res);
  } else if (req.method === 'DELETE') {
    return withPermission(PERMISSIONS.USER_DELETE, handler)(req, res);
  } else {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }
}

