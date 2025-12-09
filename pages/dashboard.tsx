import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FiBook, FiUsers, FiFileText, FiTrendingUp, FiBarChart2, FiPlus, FiShoppingCart } from 'react-icons/fi';
import { FaGraduationCap, FaChalkboardTeacher, FaUserGraduate } from 'react-icons/fa';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ProtectedRoute from '../components/protected/ProtectedRoute';
import { PERMISSIONS } from '../lib/permissions';
import { showToast } from '../lib/toast';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    courses: 0,
    students: 0,
    lessons: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userData));

    // Charger les statistiques
    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      // Ici vous pouvez appeler votre API pour récupérer les stats
      // const response = await fetch('/api/stats', {
      //   headers: { Authorization: `Bearer ${token}` },
      // });
      // const data = await response.json();
      // setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const sidebarItems = [
    { label: 'Dashboard', href: '/dashboard', icon: <FiBarChart2 className="w-5 h-5" />, permission: PERMISSIONS.DASHBOARD_VIEW },
    { label: 'Mes Formations', href: '/courses', icon: <FiBook className="w-5 h-5" /> },
  ];

  if (user?.role?.name === 'admin') {
    sidebarItems.push(
      { label: 'Gestion Formateurs', href: '/admin/formateurs', icon: <FaChalkboardTeacher className="w-5 h-5" /> },
      { label: 'Gestion Apprenants', href: '/admin/apprenants', icon: <FaUserGraduate className="w-5 h-5" />  },
      { label: 'Valider Formations', href: '/admin/courses/approve', icon: <FiTrendingUp className="w-5 h-5" />  },
      { label: 'Statistiques', href: '/admin/statistics', icon: <FiBarChart2 className="w-5 h-5" /> },
      { label: 'Gestion Rôles', href: '/admin/roles', icon: <FiUsers className="w-5 h-5" /> }
    );
  }

  if (user?.role?.name === 'formateur' || user?.role?.name === 'instructor') {
    sidebarItems.push(
      { label: 'Créer une Formation', href: '/courses/create', icon: <FiPlus className="w-5 h-5" />, permission: PERMISSIONS.COURSE_CREATE },
      { label: 'Mes Formations', href: '/formateur/courses', icon: <FiBook className="w-5 h-5" />, permission: PERMISSIONS.COURSE_READ }
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
        <Header user={user} onLogout={handleLogout} />
        <div className="flex">
          <Sidebar items={sidebarItems} userPermissions={user.role?.permissions || []} />
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">
                Bienvenue, {user.firstName} {user.lastName}!
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card hover className="border-l-4 border-l-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Formations</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.courses}</p>
                    </div>
                    <div className="bg-blue-100 rounded-full p-4">
                      <FiBook className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                </Card>

                <Card hover className="border-l-4 border-l-green-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Apprenants</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.students}</p>
                    </div>
                    <div className="bg-green-100 rounded-full p-4">
                      <FaUserGraduate className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                </Card>

                <Card hover className="border-l-4 border-l-purple-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Leçons</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.lessons}</p>
                    </div>
                    <div className="bg-purple-100 rounded-full p-4">
                      <FiFileText className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                </Card>
              </div>

              <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Activité récente</h2>
                <p className="text-gray-600">Aucune activité récente</p>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

