'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { hasPermission, Permission } from '@/lib/permissions';

interface AppProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: Permission;
  requiredRole?: string;
}

/**
 * Variante App Router de ProtectedRoute : utilise `next/navigation`.
 */
const AppProtectedRoute: React.FC<AppProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredRole,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isAuthorized, setIsAuthorized] = useState(true);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (status === 'unauthenticated') {
      const returnUrl = encodeURIComponent(pathname || '/');
      router.push(`/login?returnUrl=${returnUrl}`);
      return;
    }

    if (!session || !session.user) {
      const returnUrl = encodeURIComponent(pathname || '/');
      router.push(`/login?returnUrl=${returnUrl}`);
      return;
    }

    const user = session.user;

    if (requiredPermission && user.role) {
      const hasRequiredPermission = hasPermission(
        user.role.permissions,
        requiredPermission
      );
      if (!hasRequiredPermission) {
        setIsAuthorized(false);
        router.push('/unauthorized');
        return;
      }
    }

    if (requiredRole && user.role) {
      if (user.role.name !== requiredRole) {
        setIsAuthorized(false);
        router.push('/unauthorized');
        return;
      }
    }

    setIsAuthorized(true);
  }, [status, session, requiredPermission, requiredRole, router, pathname]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (status === 'unauthenticated' || !session || !isAuthorized) {
    return null;
  }

  return <>{children}</>;
};

export default AppProtectedRoute;
