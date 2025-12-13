import React, { useEffect } from 'react';
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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === 'unauthenticated' || !session) {
    return null;
  }

  const user = session.user;

  // Vérifier les permissions
  useEffect(() => {
    if (requiredPermission && user.role && !hasPermission(user.role.permissions, requiredPermission)) {
      router.push('/unauthorized');
    }
  }, [requiredPermission, user.role, router]);

  // Vérifier le rôle
  useEffect(() => {
    if (requiredRole && user.role && user.role.name !== requiredRole) {
      router.push('/unauthorized');
    }
  }, [requiredRole, user.role, router]);

  // Vérifier les permissions et rôles avant de rendre
  if (requiredPermission && user.role && !hasPermission(user.role.permissions, requiredPermission)) {
    return null;
  }

  if (requiredRole && user.role && user.role.name !== requiredRole) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

