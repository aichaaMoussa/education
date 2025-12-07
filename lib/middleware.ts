import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken, getUserById } from './auth';
import { PERMISSIONS, hasPermission, hasAnyPermission, hasAllPermissions } from './permissions';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: {
      id: string;
      name: string;
      permissions: string[];
    };
  };
}

// Middleware pour vérifier l'authentification
export async function requireAuth(
  req: AuthenticatedRequest,
  res: NextApiResponse
): Promise<boolean> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Non authentifié. Token manquant.' });
    return false;
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(401).json({ message: 'Token invalide ou expiré.' });
    return false;
  }

  const user = await getUserById(decoded.id);

  if (!user || !user.role) {
    res.status(401).json({ message: 'Utilisateur non trouvé.' });
    return false;
  }

  req.user = user;
  return true;
}

// Middleware pour vérifier une permission spécifique
export function requirePermission(permission: string) {
  return async (
    req: AuthenticatedRequest,
    res: NextApiResponse,
    next?: () => void
  ): Promise<boolean> => {
    const isAuthenticated = await requireAuth(req, res);
    if (!isAuthenticated) {
      return false;
    }

    if (!req.user) {
      res.status(401).json({ message: 'Utilisateur non authentifié.' });
      return false;
    }

    if (!hasPermission(req.user.role.permissions, permission as any)) {
      res.status(403).json({ 
        message: 'Accès refusé. Permission requise: ' + permission 
      });
      return false;
    }

    if (next) next();
    return true;
  };
}

// Middleware pour vérifier plusieurs permissions (au moins une)
export function requireAnyPermission(permissions: string[]) {
  return async (
    req: AuthenticatedRequest,
    res: NextApiResponse,
    next?: () => void
  ): Promise<boolean> => {
    const isAuthenticated = await requireAuth(req, res);
    if (!isAuthenticated) {
      return false;
    }

    if (!req.user) {
      res.status(401).json({ message: 'Utilisateur non authentifié.' });
      return false;
    }

    if (!hasAnyPermission(req.user.role.permissions, permissions as any[])) {
      res.status(403).json({ 
        message: 'Accès refusé. Aucune permission requise trouvée.' 
      });
      return false;
    }

    if (next) next();
    return true;
  };
}

// Middleware pour vérifier toutes les permissions
export function requireAllPermissions(permissions: string[]) {
  return async (
    req: AuthenticatedRequest,
    res: NextApiResponse,
    next?: () => void
  ): Promise<boolean> => {
    const isAuthenticated = await requireAuth(req, res);
    if (!isAuthenticated) {
      return false;
    }

    if (!req.user) {
      res.status(401).json({ message: 'Utilisateur non authentifié.' });
      return false;
    }

    if (!hasAllPermissions(req.user.role.permissions, permissions as any[])) {
      res.status(403).json({ 
        message: 'Accès refusé. Toutes les permissions requises ne sont pas présentes.' 
      });
      return false;
    }

    if (next) next();
    return true;
  };
}

// Middleware pour vérifier un rôle spécifique
export function requireRole(roleName: string) {
  return async (
    req: AuthenticatedRequest,
    res: NextApiResponse,
    next?: () => void
  ): Promise<boolean> => {
    const isAuthenticated = await requireAuth(req, res);
    if (!isAuthenticated) {
      return false;
    }

    if (!req.user) {
      res.status(401).json({ message: 'Utilisateur non authentifié.' });
      return false;
    }

    if (req.user.role.name !== roleName) {
      res.status(403).json({ 
        message: `Accès refusé. Rôle requis: ${roleName}` 
      });
      return false;
    }

    if (next) next();
    return true;
  };
}

// Helper pour wrapper les handlers API avec middleware
export function withAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    const isAuthenticated = await requireAuth(req, res);
    if (!isAuthenticated) {
      return;
    }
    return handler(req, res);
  };
}

export function withPermission(
  permission: string,
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    const hasAccess = await requirePermission(permission)(req, res);
    if (!hasAccess) {
      return;
    }
    return handler(req, res);
  };
}

