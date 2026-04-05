import type { NextApiRequest, NextApiResponse } from 'next';
// Import models first to ensure they are registered
import '../../../../models';
import connectDB from '../../../../lib/mongodb';
import Role from '../../../../models/Role';
import { withPermission, AuthenticatedRequest } from '../../../../lib/middleware';
import { PERMISSIONS } from '../../../../lib/permissions';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const roles = await Role.find().select('-__v').sort({ createdAt: -1 });
      return res.status(200).json(roles);
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      return res.status(500).json({ message: 'Erreur lors de la récupération des rôles' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, permissions, description } = req.body;

      if (!name || !permissions || !Array.isArray(permissions)) {
        return res.status(400).json({ 
          message: 'Le nom et les permissions (tableau) sont requis' 
        });
      }

      // Vérifier si le rôle existe déjà
      const existingRole = await Role.findOne({ name });
      if (existingRole) {
        return res.status(400).json({ message: 'Ce rôle existe déjà' });
      }

      const role = await Role.create({
        name,
        permissions,
        description: description || '',
      });

      return res.status(201).json({
        message: 'Rôle créé avec succès',
        role,
      });
    } catch (error: any) {
      console.error('Error creating role:', error);
      if (error.code === 11000) {
        return res.status(400).json({ message: 'Ce rôle existe déjà' });
      }
      return res.status(500).json({ message: 'Erreur lors de la création du rôle' });
    }
  }

  return res.status(405).json({ message: 'Méthode non autorisée' });
}

export default withPermission(PERMISSIONS.ROLE_READ, handler);

