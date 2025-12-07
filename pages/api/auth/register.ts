import type { NextApiRequest, NextApiResponse } from 'next';
// Import models first to ensure they are registered
import '../../../models';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import Role from '../../../models/Role';
import { hashPassword } from '../../../lib/auth';
import { ROLE_PERMISSIONS } from '../../../lib/permissions';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { email, password, firstName, lastName, roleName = 'apprenant' } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Trouver ou créer le rôle
    let role = await Role.findOne({ name: roleName });
    if (!role) {
      const permissions = ROLE_PERMISSIONS[roleName as keyof typeof ROLE_PERMISSIONS] || ROLE_PERMISSIONS.student;
      role = await Role.create({
        name: roleName,
        permissions,
        description: `Role ${roleName}`,
      });
    }

    // Créer l'utilisateur
    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: role._id,
    });

    return res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

