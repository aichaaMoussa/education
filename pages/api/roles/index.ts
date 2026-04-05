// Cette route est dépréciée, utilisez /api/admin/roles à la place
// Redirection vers la nouvelle route admin
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Rediriger vers la nouvelle route admin
  return res.status(301).json({ 
    message: 'Cette route est dépréciée. Utilisez /api/admin/roles à la place.',
    redirect: '/api/admin/roles'
  });
}

