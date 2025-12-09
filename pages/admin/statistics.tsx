import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FiUsers, FiBook, FiDollarSign, FiTrendingUp, FiBarChart2, FiUserCheck } from 'react-icons/fi';
import { FaGraduationCap, FaChalkboardTeacher, FaUserGraduate } from 'react-icons/fa';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import Card from '../../components/ui/Card';
import ProtectedRoute from '../../components/protected/ProtectedRoute';
import { PERMISSIONS } from '../../lib/permissions';

interface Statistics {
  totalFormateurs: number;
  totalApprenants: number;
  totalFormations: number;
  formationsApprouvees: number;
  formationsEnAttente: number;
  revenusTotal: number;
  inscriptionsTotal: number;
}

export default function Statistics() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<Statistics>({
    totalFormateurs: 0,
    totalApprenants: 0,
    totalFormations: 0,
    formationsApprouvees: 0,
    formationsEnAttente: 0,
    revenusTotal: 0,
    inscriptionsTotal: 0,
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/statistics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const sidebarItems = [
    { label: 'Dashboard', href: '/dashboard', icon: <FiBarChart2 className="w-5 h-5" />, permission: PERMISSIONS.DASHBOARD_VIEW },
    { label: 'Gestion Formateurs', href: '/admin/formateurs', icon: <FaChalkboardTeacher className="w-5 h-5" />, permission: PERMISSIONS.USER_READ },
    { label: 'Gestion Apprenants', href: '/admin/apprenants', icon: <FaUserGraduate className="w-5 h-5" />, permission: PERMISSIONS.USER_READ },
    { label: 'Valider Formations', href: '/admin/courses/approve', icon: <FiUserCheck className="w-5 h-5" />, permission: PERMISSIONS.COURSE_READ },
    { label: 'Statistiques', href: '/admin/statistics', icon: <FiBarChart2 className="w-5 h-5" />, permission: PERMISSIONS.DASHBOARD_ADMIN },
  ];

  const statCards = [
    {
      title: 'Formateurs',
      value: stats.totalFormateurs,
      icon: <FaChalkboardTeacher className="w-8 h-8" />,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
    },
    {
      title: 'Apprenants',
      value: stats.totalApprenants,
      icon: <FaUserGraduate className="w-8 h-8" />,
      color: 'bg-green-500',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
    },
    {
      title: 'Formations',
      value: stats.totalFormations,
      icon: <FiBook className="w-8 h-8" />,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
    },
    {
      title: 'Formations Approuvées',
      value: stats.formationsApprouvees,
      icon: <FiUserCheck className="w-8 h-8" />,
      color: 'bg-green-500',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
    },
    {
      title: 'En Attente',
      value: stats.formationsEnAttente,
      icon: <FiTrendingUp className="w-8 h-8" />,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
    },
    {
      title: 'Revenus Total',
      value: `${stats.revenusTotal}€`,
      icon: <FiDollarSign className="w-8 h-8" />,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-100',
      textColor: 'text-indigo-600',
    },
    {
      title: 'Inscriptions',
      value: stats.inscriptionsTotal,
      icon: <FiUsers className="w-8 h-8" />,
      color: 'bg-pink-500',
      bgColor: 'bg-pink-100',
      textColor: 'text-pink-600',
    },
  ];

  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.DASHBOARD_ADMIN}>
      <Head>
        <title>Statistiques - Admin</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <Header user={user} onLogout={handleLogout} />
        <div className="flex">
          <Sidebar items={sidebarItems} userPermissions={user?.role?.permissions || []} />
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
                  <FiBarChart2 className="text-blue-600" />
                  <span>Statistiques de la Plateforme</span>
                </h1>
                <p className="text-gray-600 mt-1">Vue d'ensemble complète de la plateforme</p>
              </div>

              {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                  <Card key={index} hover className="overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                        <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
                      </div>
                      <div className={`${stat.bgColor} rounded-full p-4 ${stat.textColor}`}>
                        {stat.icon}
                      </div>
                    </div>
                  </Card>
                ))}
              </div> */}

              <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité Récente</h3>
                  <p className="text-gray-600">Aucune activité récente</p>
                </Card>
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Formations Populaires</h3>
                  <p className="text-gray-600">Aucune donnée disponible</p>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

