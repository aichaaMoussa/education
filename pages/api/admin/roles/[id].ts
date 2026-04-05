import type { NextApiRequest, NextApiResponse } from 'next';
// Import models first to ensure they are registered
import '../../../../models';
import connectDB from '../../../../lib/mongodb';
import Role from '../../../../models/Role';
import { withPermission, AuthenticatedRequest } from '../../../../lib/middleware';
import { PERMISSIONS } from '../../../../lib/permissions';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  await connectDB();
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'ID du rôle requis' });
  }

  if (req.method === 'GET') {
    try {
      const role = await Role.findById(id);
      if (!role) {
        return res.status(404).json({ message: 'Rôle non trouvé' });
      }
      return res.status(200).json(role);
    } catch (error: any) {
      console.error('Error fetching role:', error);
      return res.status(500).json({ message: 'Erreur lors de la récupération du rôle' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { name, permissions, description } = req.body;

      if (!name || !permissions || !Array.isArray(permissions)) {
        return res.status(400).json({ 
          message: 'Le nom et les permissions (tableau) sont requis' 
        });
      }

      const role = await Role.findByIdAndUpdate(
        id,
        {
          name,
          permissions,
          description: description || '',
        },
        { new: true, runValidators: true }
      );

      if (!role) {
        return res.status(404).json({ message: 'Rôle non trouvé' });
      }

      return res.status(200).json({
        message: 'Rôle mis à jour avec succès',
        role,
      });
    } catch (error: any) {
      console.error('Error updating role:', error);
      if (error.code === 11000) {
        return res.status(400).json({ message: 'Ce nom de rôle existe déjà' });
      }
      return res.status(500).json({ message: 'Erreur lors de la mise à jour du rôle' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Vérifier si le rôle est utilisé par des utilisateurs
      const User = (await import('../../../../models/User')).default;
      const usersWithRole = await User.countDocuments({ role: id });
      
      if (usersWithRole > 0) {
        return res.status(400).json({ 
          message: `Impossible de supprimer ce rôle. Il est utilisé par ${usersWithRole} utilisateur(s).` 
        });
      }

      const role = await Role.findByIdAndDelete(id);
      if (!role) {
        return res.status(404).json({ message: 'Rôle non trouvé' });
      }

      return res.status(200).json({
        message: 'Rôle supprimé avec succès',
      });
    } catch (error: any) {
      console.error('Error deleting role:', error);
      return res.status(500).json({ message: 'Erreur lors de la suppression du rôle' });
    }
  }

  return res.status(405).json({ message: 'Méthode non autorisée' });
}

// Pour PUT et DELETE, on vérifie les permissions de modification
export default async function(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return withPermission(PERMISSIONS.ROLE_READ, handler)(req, res);
  } else if (req.method === 'PUT') {
    return withPermission(PERMISSIONS.ROLE_UPDATE, handler)(req, res);
  } else if (req.method === 'DELETE') {
    return withPermission(PERMISSIONS.ROLE_DELETE, handler)(req, res);
  } else {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }
}

