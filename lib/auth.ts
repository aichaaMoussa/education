import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from './mongodb';
// Import models to ensure they are registered
import '../models';
import User from '../models/User';
import Role from '../models/Role';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: {
    id: string;
    name: string;
    permissions: string[];
  };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function authenticateUser(email: string, password: string): Promise<AuthUser | null> {
  await connectDB();
  
  const user = await User.findOne({ email }).populate('role');
  
  if (!user || !user.isActive) {
    return null;
  }

  const isValid = await verifyPassword(password, user.password);
  
  if (!isValid) {
    return null;
  }

  const role = user.role as any;

  return {
    id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: {
      id: role._id.toString(),
      name: role.name,
      permissions: role.permissions || [],
    },
  };
}

export async function getUserById(userId: string): Promise<AuthUser | null> {
  await connectDB();
  
  const user = await User.findById(userId).populate('role');
  
  if (!user || !user.isActive) {
    return null;
  }

  const role = user.role as any;

  return {
    id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: {
      id: role._id.toString(),
      name: role.name,
      permissions: role.permissions || [],
    },
  };
}

