import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { FiMail, FiBarChart2, FiCheckCircle, FiShield } from 'react-icons/fi';
import { FaBookOpen, FaChalkboardTeacher, FaUserGraduate } from 'react-icons/fa';
import { HiOutlineCollection } from 'react-icons/hi';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import Card from '../../components/ui/Card';
import ProtectedRoute from '../../components/protected/ProtectedRoute';
import { PERMISSIONS } from '../../lib/permissions';
import { showToast } from '../../lib/toast';

interface Formateur {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: {
    _id: string;
    name: string;
  };
  isActive: boolean;
  createdAt: string;
}

export default function FormateursManagement() {
  const router = useRouter();
  const { data: session } = useSession();
  const [formateurs, setFormateurs] = useState<Formateur[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchFormateurs();
    }
  }, [session]);

  const fetchFormateurs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/formateurs');
      if (response.ok) {
        const data = await response.json();
        setFormateurs(data);
      } else {
        showToast.error('Erreur lors du chargement des formateurs');
      }
    } catch (error) {
      console.error('Error fetching formateurs:', error);
      showToast.error('Erreur lors du chargement des formateurs');
    } finally {
      setLoading(false);
    }
  };


  const user = session?.user;

  const sidebarItems: any[] = [
    { label: 'Dashboard', href: '/dashboard', icon: <FiBarChart2 className="w-5 h-5" />, permission: PERMISSIONS.DASHBOARD_VIEW },
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
    { label: 'Gestion Rôles', href: '/admin/roles', icon: <FiShield className="w-5 h-5" />, permission: PERMISSIONS.ROLE_READ },
  ];

  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.USER_READ}>
      <Head>
        <title>Gestion des Formateurs - Admin</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <Header 
          user={user ? {
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            role: { name: user.role?.name || '' }
          } : undefined} 
          onLogout={async () => {
            const { signOut } = await import('next-auth/react');
            await signOut({ redirect: false });
            router.push('/login');
          }} 
        />
        <div className="flex">
          <Sidebar items={sidebarItems} userPermissions={(user?.role?.permissions || []) as any} />
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
                  <FaChalkboardTeacher className="text-blue-600" />
                  <span>Gestion des Formateurs</span>
                </h1>
                <p className="text-gray-600 mt-1">Consultez la liste des formateurs de la plateforme</p>
              </div>

              {loading ? (
                <Card>
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement des formateurs...</p>
                  </div>
                </Card>
              ) : formateurs.length === 0 ? (
                <Card className="text-center py-12">
                  <FaChalkboardTeacher className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Aucun formateur enregistré</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {formateurs.map((formateur) => (
                    <Card key={formateur._id} hover className="border-l-4 border-l-blue-500">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 rounded-full p-3">
                            <FaChalkboardTeacher className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {formateur.firstName} {formateur.lastName}
                            </h3>
                            <p className="text-sm text-gray-500 flex items-center space-x-1 mt-1">
                              <FiMail className="w-3 h-3" />
                              <span>{formateur.email}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          formateur.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {formateur.isActive ? 'Actif' : 'Inactif'}
                        </span>
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

