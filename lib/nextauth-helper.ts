// Helper pour utiliser next-auth dans les API routes
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../pages/api/auth/[...nextauth]';
import type { NextApiRequest, NextApiResponse } from 'next';

export async function getSession(req: NextApiRequest, res: NextApiResponse) {
  return await getServerSession(req, res, authOptions);
}

export async function requireNextAuthSession(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession(req, res);

  if (!session || !session.user) {
    res.status(401).json({ message: 'Non authentifié' });
    return null;
  }

  return session;
}

