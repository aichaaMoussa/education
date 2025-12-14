import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { hasPermission, Permission } from '../../lib/permissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: Permission;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredRole,
}) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isAuthorized, setIsAuthorized] = useState(true);

  // Tous les hooks doivent être appelés avant tous les returns conditionnels
  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (!session || !session.user) {
      router.push('/login');
      return;
    }

    const user = session.user;

    // Vérifier les permissions
    if (requiredPermission && user.role) {
      const hasRequiredPermission = hasPermission(user.role.permissions, requiredPermission);
      if (!hasRequiredPermission) {
        setIsAuthorized(false);
        router.push('/unauthorized');
        return;
      }
    }

    // Vérifier le rôle
    if (requiredRole && user.role) {
      if (user.role.name !== requiredRole) {
        setIsAuthorized(false);
        router.push('/unauthorized');
        return;
      }
    }

    setIsAuthorized(true);
  }, [status, session, requiredPermission, requiredRole, router]);

  // Rendu conditionnel après tous les hooks
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === 'unauthenticated' || !session || !isAuthorized) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

