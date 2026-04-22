'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  FiBarChart2,
  FiShoppingCart,
  FiTrendingUp,
  FiCpu,
  FiArrowRight,
} from 'react-icons/fi';
import Header from '@/components/layout/Header';
import AppRouterSidebar from '@/components/layout/AppRouterSidebar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import AppProtectedRoute from '@/components/protected/AppProtectedRoute';
import GeminiQuiz from '@/components/quiz/GeminiQuiz';
import { PERMISSIONS } from '@/lib/permissions';

/**
 * Page App Router « Test de niveau » : shell identique au reste de l’espace apprenant.
 */
export default function GeminiTestNiveauClient() {
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
    <AppProtectedRoute requiredPermission={PERMISSIONS.DASHBOARD_VIEW}>
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
          <AppRouterSidebar
            items={sidebarItems}
            userPermissions={(user.role?.permissions || []) as any}
          />
          <main className="flex-1 p-8">
            <div className="mx-auto max-w-3xl">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-700">
                <FiCpu className="h-4 w-4" />
                Évaluation IT — Google Gemini (serveur)
              </div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                Test de niveau
              </h1>
              <p className="mb-8 text-gray-600">
                Questions techniques générées dynamiquement ; difficulté adaptée
                à vos réponses. Configurez{' '}
                <code className="rounded bg-gray-100 px-1 text-sm">
                  GEMINI_API_KEY
                </code>{' '}
                sur le serveur (jamais exposée au navigateur).
              </p>

              <Card className="mb-8 border border-blue-100 bg-blue-50/80 p-4 text-sm text-blue-950">
                <p className="font-semibold text-blue-900 mb-1">Rappel</p>
                <p>
                  Ce parcours utilise les routes App Router{' '}
                  <code className="rounded bg-white/80 px-1">/api/generate-question</code>{' '}
                  et{' '}
                  <code className="rounded bg-white/80 px-1">/api/explain</code>.
                  Vous validez chaque réponse, lisez le feedback IA, puis passez
                  à la question suivante.
                </p>
              </Card>

              <GeminiQuiz />

              <div className="mt-10">
                <Link href="/courses">
                  <Button variant="outline">
                    Catalogue des formations
                    <FiArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    </AppProtectedRoute>
  );
}
