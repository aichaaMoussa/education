import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import {
  FiBarChart2,
  FiShoppingCart,
  FiTrendingUp,
  FiCpu,
  FiBook,
  FiArrowRight,
} from 'react-icons/fi';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ProtectedRoute from '../../components/protected/ProtectedRoute';
import { PERMISSIONS } from '../../lib/permissions';
import { showToast } from '../../lib/toast';
import { normalizeMediaUrl } from '../../lib/utils/url';

interface CourseCard {
  _id: string;
  title: string;
  category: string;
  thumbnail?: string;
}

export default function ApprenantCourses() {
  const router = useRouter();
  const { data: session } = useSession();
  const [courses, setCourses] = useState<CourseCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;

    const load = async () => {
      try {
        setLoading(true);
        const meRes = await fetch('/api/enrollments/me', {
          credentials: 'include',
        });
        if (!meRes.ok) {
          showToast.error('Impossible de charger vos inscriptions');
          setCourses([]);
          return;
        }
        const { courseIds } = (await meRes.json()) as { courseIds?: string[] };
        const ids = Array.isArray(courseIds) ? courseIds : [];
        if (ids.length === 0) {
          setCourses([]);
          return;
        }

        const results = await Promise.all(
          ids.map(async (courseId) => {
            const res = await fetch(`/api/courses/${courseId}`, {
              credentials: 'include',
              cache: 'no-store',
            });
            if (!res.ok) return null;
            const data = await res.json();
            return {
              _id: String(data._id ?? courseId),
              title: String(data.title ?? 'Formation'),
              category: String(data.category ?? ''),
              thumbnail: data.thumbnail as string | undefined,
            } as CourseCard;
          })
        );

        setCourses(results.filter((c): c is CourseCard => c !== null));
      } catch (e) {
        console.error(e);
        showToast.error('Erreur de chargement');
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [session?.user]);

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
        <title>Mes formations achetées - itkane</title>
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
                Mes formations achetées
              </h1>
              <p className="text-gray-600 mb-8">
                Accédez au contenu des formations auxquelles vous êtes inscrit.
              </p>

              {loading ? (
                <Card className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
                  <p className="mt-4 text-gray-600">Chargement...</p>
                </Card>
              ) : courses.length === 0 ? (
                <Card className="p-8 text-center">
                  <FiBook className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Vous n&apos;avez pas encore de formation achetée.
                  </p>
                  <Link href="/courses">
                    <Button variant="primary">Parcourir le catalogue</Button>
                  </Link>
                </Card>
              ) : (
                <div className="space-y-4">
                  {courses.map((course) => (
                    <Card key={course._id} hover className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="w-full sm:w-40 h-24 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 overflow-hidden flex-shrink-0">
                          {course.thumbnail ? (
                            <img
                              src={normalizeMediaUrl(course.thumbnail)}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/80">
                              <FiBook className="w-10 h-10" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-blue-600 font-medium mb-1">
                            {course.category}
                          </p>
                          <h2 className="text-xl font-semibold text-gray-900 mb-3">
                            {course.title}
                          </h2>
                          <Link href={`/courses/${course._id}`}>
                            <Button variant="primary" className="inline-flex items-center gap-2">
                              Accéder à la formation
                              <FiArrowRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
