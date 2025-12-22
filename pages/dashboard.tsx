import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import { FiBook, FiUsers, FiFileText, FiTrendingUp, FiBarChart2, FiPlus, FiShoppingCart, FiCheckCircle } from 'react-icons/fi';
import { FaGraduationCap, FaChalkboardTeacher, FaUserGraduate, FaBookOpen } from 'react-icons/fa';
import { HiOutlineCollection } from 'react-icons/hi';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ProtectedRoute from '../components/protected/ProtectedRoute';
import { PERMISSIONS } from '../lib/permissions';
import { showToast } from '../lib/toast';

export default function Dashboard() {
  const router = useRouter();
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    courses: 0,
    students: 0,
    lessons: 0,
    formateurs: 0,
    apprenants: 0,
    formationsApprouvees: 0,
    formationsEnAttente: 0,
    revenusTotal: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchStats();
    }
  }, [session]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const user = session?.user;
      
      if (user?.role?.name === 'admin') {
        // Pour admin, récupérer toutes les statistiques
        const response = await fetch('/api/admin/statistics');
        if (response.ok) {
          const data = await response.json();
          setStats({
            courses: data.totalFormations || 0,
            students: data.totalApprenants || 0,
            lessons: 0, // À implémenter si nécessaire
            formateurs: data.totalFormateurs || 0,
            apprenants: data.totalApprenants || 0,
            formationsApprouvees: data.formationsApprouvees || 0,
            formationsEnAttente: data.formationsEnAttente || 0,
            revenusTotal: data.revenusTotal || 0,
          });
        }
      } else if (user?.role?.name === 'formateur' || user?.role?.name === 'instructor') {
        // Pour formateur, récupérer ses propres statistiques
        const coursesResponse = await fetch('/api/formateur/courses');
        if (coursesResponse.ok) {
          const courses = await coursesResponse.json();
          setStats({
            courses: courses.length || 0,
            students: 0, // À implémenter si nécessaire
            lessons: 0,
            formateurs: 0,
            apprenants: 0,
            formationsApprouvees: courses.filter((c: any) => c.isApproved).length || 0,
            formationsEnAttente: courses.filter((c: any) => !c.isApproved && c.isPublished).length || 0,
            revenusTotal: 0,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  const user = session?.user;

  const sidebarItems: any[] = [
    { label: 'Dashboard', href: '/dashboard', icon: <FiBarChart2 className="w-5 h-5" />, permission: PERMISSIONS.DASHBOARD_VIEW },
  ];

  if (user?.role?.name === 'admin') {
    sidebarItems.push(
      {
        label: 'Gestion de Formation',
        icon: <FaBookOpen className="w-5 h-5" />,
        permission: PERMISSIONS.COURSE_READ,
        children: [
          { label: 'Formations à Valider', href: '/admin/courses/approve', icon: <FiCheckCircle className="w-4 h-4" /> },
          { label: 'Toutes les Formations', href: '/admin/courses/all', icon: <HiOutlineCollection className="w-4 h-4" /> },
        ]
      },
      { label: 'Gestion Formateurs', href: '/admin/formateurs', icon: <FaChalkboardTeacher className="w-5 h-5" />, permission: PERMISSIONS.USER_READ },
      { label: 'Gestion Apprenants', href: '/admin/apprenants', icon: <FaUserGraduate className="w-5 h-5" />, permission: PERMISSIONS.USER_READ },
      { label: 'Statistiques', href: '/admin/statistics', icon: <FiBarChart2 className="w-5 h-5" />, permission: PERMISSIONS.DASHBOARD_ADMIN },
      { label: 'Gestion Rôles', href: '/admin/roles', icon: <FiUsers className="w-5 h-5" />, permission: PERMISSIONS.ROLE_READ }
    );
  }

  if (user?.role?.name === 'formateur' || user?.role?.name === 'instructor') {
    sidebarItems.push(
      { label: 'Créer une Formation', href: '/admin/courses/create', icon: <FiPlus className="w-5 h-5" />, permission: PERMISSIONS.COURSE_CREATE },
      { label: 'Mes Formations', href: '/formateur/courses', icon: <FiBook className="w-5 h-5" /> }
    );
  }

  if (user?.role?.name === 'apprenant' || user?.role?.name === 'student') {
    sidebarItems.push(
      { label: 'Mes Formations Achetées', href: '/apprenant/courses', icon: <FiShoppingCart className="w-5 h-5" /> },
      { label: 'Ma Progression', href: '/apprenant/progress', icon: <FiTrendingUp className="w-5 h-5" /> }
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.DASHBOARD_VIEW}>
      <Head>
        <title>Dashboard - Easy Tech</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <Header 
          user={user ? {
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            role: { name: user.role?.name || '' }
          } : undefined} 
          onLogout={handleLogout} 
        />
        <div className="flex">
          <Sidebar items={sidebarItems} userPermissions={(user?.role?.permissions || []) as any} />
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Bienvenue, {user?.firstName || ''} {user?.lastName || ''}! 👋
                </h1>
                <p className="text-gray-600 text-lg">
                  {user?.role?.name === 'admin' 
                    ? 'Tableau de bord administrateur - Vue d\'ensemble de votre plateforme'
                    : user?.role?.name === 'formateur' || user?.role?.name === 'instructor'
                    ? 'Gérez vos formations et suivez vos statistiques'
                    : 'Consultez vos formations et votre progression'
                  }
                </p>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <div className="h-24 bg-gray-200 rounded"></div>
                    </Card>
                  ))}
                </div>
              ) : (
                <>
                  {user?.role?.name === 'admin' ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card hover className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-white shadow-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600 mb-1">Total Formations</p>
                              <p className="text-3xl font-bold text-gray-900">{stats.courses}</p>
                              <p className="text-xs text-gray-500 mt-1">{stats.formationsApprouvees} approuvées</p>
                            </div>
                            <div className="bg-blue-100 rounded-full p-4">
                              <FiBook className="w-8 h-8 text-blue-600" />
                            </div>
                          </div>
                        </Card>

                        <Card hover className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-white shadow-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600 mb-1">Apprenants</p>
                              <p className="text-3xl font-bold text-gray-900">{stats.apprenants}</p>
                              <p className="text-xs text-gray-500 mt-1">Inscrits actifs</p>
                            </div>
                            <div className="bg-green-100 rounded-full p-4">
                              <FaUserGraduate className="w-8 h-8 text-green-600" />
                            </div>
                          </div>
                        </Card>

                        <Card hover className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-white shadow-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600 mb-1">Formateurs</p>
                              <p className="text-3xl font-bold text-gray-900">{stats.formateurs}</p>
                              <p className="text-xs text-gray-500 mt-1">Actifs</p>
                            </div>
                            <div className="bg-purple-100 rounded-full p-4">
                              <FaChalkboardTeacher className="w-8 h-8 text-purple-600" />
                            </div>
                          </div>
                        </Card>

                        <Card hover className="border-l-4 border-l-yellow-500 bg-gradient-to-br from-yellow-50 to-white shadow-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600 mb-1">Revenus Total</p>
                              <p className="text-3xl font-bold text-gray-900">{stats.revenusTotal.toLocaleString()} €</p>
                              <p className="text-xs text-gray-500 mt-1">Tous les temps</p>
                            </div>
                            <div className="bg-yellow-100 rounded-full p-4">
                              <FiTrendingUp className="w-8 h-8 text-yellow-600" />
                            </div>
                          </div>
                        </Card>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <Card hover className="border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50 to-white shadow-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600 mb-1">Formations Approuvées</p>
                              <p className="text-3xl font-bold text-gray-900">{stats.formationsApprouvees}</p>
                              <p className="text-xs text-emerald-600 mt-1">✓ Disponibles</p>
                            </div>
                            <div className="bg-emerald-100 rounded-full p-4">
                              <FiCheckCircle className="w-8 h-8 text-emerald-600" />
                            </div>
                          </div>
                        </Card>

                        <Card hover className="border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50 to-white shadow-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600 mb-1">En Attente</p>
                              <p className="text-3xl font-bold text-gray-900">{stats.formationsEnAttente}</p>
                              <p className="text-xs text-orange-600 mt-1">⏳ À valider</p>
                            </div>
                            <div className="bg-orange-100 rounded-full p-4">
                              <FiFileText className="w-8 h-8 text-orange-600" />
                            </div>
                          </div>
                        </Card>
                      </div>
                    </>
                  ) : user?.role?.name === 'formateur' || user?.role?.name === 'instructor' ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <Card hover className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-white shadow-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Mes Formations</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.courses}</p>
                            <p className="text-xs text-gray-500 mt-1">Total créées</p>
                          </div>
                          <div className="bg-blue-100 rounded-full p-4">
                            <FiBook className="w-8 h-8 text-blue-600" />
                          </div>
                        </div>
                      </Card>

                      <Card hover className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-white shadow-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Approuvées</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.formationsApprouvees}</p>
                            <p className="text-xs text-green-600 mt-1">✓ Publiées</p>
                          </div>
                          <div className="bg-green-100 rounded-full p-4">
                            <FiCheckCircle className="w-8 h-8 text-green-600" />
                          </div>
                        </div>
                      </Card>

                      <Card hover className="border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50 to-white shadow-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">En Attente</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.formationsEnAttente}</p>
                            <p className="text-xs text-orange-600 mt-1">⏳ Validation</p>
                          </div>
                          <div className="bg-orange-100 rounded-full p-4">
                            <FiFileText className="w-8 h-8 text-orange-600" />
                          </div>
                        </div>
                      </Card>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <Card hover className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-white shadow-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Mes Formations</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.courses}</p>
                            <p className="text-xs text-gray-500 mt-1">Achetées</p>
                          </div>
                          <div className="bg-blue-100 rounded-full p-4">
                            <FiBook className="w-8 h-8 text-blue-600" />
                          </div>
                        </div>
                      </Card>
                    </div>
                  )}

                  <Card className="shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-gray-900">Actions rapides</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {user?.role?.name === 'admin' && (
                        <>
                          <Button
                            onClick={() => router.push('/admin/courses/approve')}
                            className="w-full justify-start"
                            variant="outline"
                          >
                            <FiCheckCircle className="mr-2" />
                            Valider les formations
                          </Button>
                          <Button
                            onClick={() => router.push('/admin/courses/all')}
                            className="w-full justify-start"
                            variant="outline"
                          >
                            <FiBook className="mr-2" />
                            Toutes les formations
                          </Button>
                          <Button
                            onClick={() => router.push('/admin/statistics')}
                            className="w-full justify-start"
                            variant="outline"
                          >
                            <FiBarChart2 className="mr-2" />
                            Statistiques détaillées
                          </Button>
                        </>
                      )}
                      {(user?.role?.name === 'formateur' || user?.role?.name === 'instructor') && (
                        <>
                          <Button
                            onClick={() => router.push('/admin/courses/create')}
                            className="w-full justify-start"
                            variant="primary"
                          >
                            <FiPlus className="mr-2" />
                            Créer une formation
                          </Button>
                          <Button
                            onClick={() => router.push('/formateur/courses')}
                            className="w-full justify-start"
                            variant="outline"
                          >
                            <FiBook className="mr-2" />
                            Mes formations
                          </Button>
                        </>
                      )}
                    </div>
                  </Card>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

