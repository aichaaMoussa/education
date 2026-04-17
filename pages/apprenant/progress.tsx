import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import { FiBarChart2, FiShoppingCart, FiTrendingUp, FiCpu } from 'react-icons/fi';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ProtectedRoute from '../../components/protected/ProtectedRoute';
import { PERMISSIONS } from '../../lib/permissions';

export default function ApprenantProgress() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  const sidebarItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: <FiBarChart2 className="w-5 h-5" />,
      permission: PERMISSIONS.DASHBOARD_VIEW,
    },
    {
      label: 'Mes Formations Achetées',
      href: '/apprenant/courses',
      icon: <FiShoppingCart className="w-5 h-5" />,
      permission: PERMISSIONS.DASHBOARD_VIEW,
    },
    {
      label: 'Test de niveau (IA)',
      href: '/apprenant/test-niveau',
      icon: <FiCpu className="w-5 h-5" />,
      permission: PERMISSIONS.DASHBOARD_VIEW,
    },
    {
      label: 'Ma Progression',
      href: '/apprenant/progress',
      icon: <FiTrendingUp className="w-5 h-5" />,
      permission: PERMISSIONS.DASHBOARD_VIEW,
    },
  ];

  if (!user) return null;

  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.DASHBOARD_VIEW}>
      <Head>
        <title>Ma progression - itkane</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <Header
          user={{
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            role: { name: user.role?.name || '' },
          }}
          onLogout={async () => {
            await signOut({ redirect: false });
            router.push('/login');
          }}
        />
        <div className="flex">
          <Sidebar
            items={sidebarItems}
            userPermissions={(user.role?.permissions || []) as any}
          />
          <main className="flex-1 p-8">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Ma progression
              </h1>
              <p className="text-gray-600 mb-8">
                Le suivi détaillé par leçon sera disponible prochainement.
              </p>
              <Card className="p-8">
                <p className="text-gray-700 mb-6">
                  En attendant, ouvrez une formation depuis la liste ci-dessous
                  pour suivre les vidéos et les contenus.
                </p>
                <Link href="/apprenant/courses">
                  <Button variant="primary">Voir mes formations achetées</Button>
                </Link>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
