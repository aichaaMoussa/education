import type { NextApiRequest, NextApiResponse } from 'next';
import { withPermission, AuthenticatedRequest } from '../../../../lib/middleware';
import { PERMISSIONS } from '../../../../lib/permissions';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Retourner toutes les permissions disponibles
    const allPermissions = Object.values(PERMISSIONS).map(perm => ({
      value: perm,
      label: perm.replace(':', ' - ').replace(/_/g, ' '),
      category: perm.split(':')[0],
    }));

    // Grouper par catégorie
    const groupedPermissions = allPermissions.reduce((acc: any, perm) => {
      if (!acc[perm.category]) {
        acc[perm.category] = [];
      }
      acc[perm.category].push(perm);
      return acc;
    }, {});

    return res.status(200).json({
      permissions: allPermissions,
      grouped: groupedPermissions,
      all: PERMISSIONS,
    });
  }

  return res.status(405).json({ message: 'Méthode non autorisée' });
}

// Seuls les admins peuvent voir toutes les permissions
export default withPermission(PERMISSIONS.ROLE_READ, handler);

