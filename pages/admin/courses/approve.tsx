import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { FiCheckCircle, FiXCircle, FiEye, FiFileText, FiVideo, FiHelpCircle, FiBarChart2, FiBook } from 'react-icons/fi';
import { FaBookOpen } from 'react-icons/fa';
import { HiOutlineCollection } from 'react-icons/hi';
import { FaGraduationCap, FaChalkboardTeacher, FaUserGraduate } from 'react-icons/fa';
import Header from '../../../components/layout/Header';
import Sidebar from '../../../components/layout/Sidebar';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import ProtectedRoute from '../../../components/protected/ProtectedRoute';
import { PERMISSIONS } from '../../../lib/permissions';
import { showToast } from '../../../lib/toast';

interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: {
    firstName: string;
    lastName: string;
    email: string;
  };
  price: number;
  category: string;
  level: string;
  isPublished: boolean;
  isApproved: boolean;
  resources?: {
    pdfs: string[];
    videos: string[];
    quizzes: string[];
  };
  createdAt: string;
}

export default function ApproveCourses() {
  const router = useRouter();
  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'approve' | 'reject' | null;
    courseId: string | null;
  }>({
    isOpen: false,
    type: null,
    courseId: null,
  });

  useEffect(() => {
    if (session?.user) {
      fetchCourses();
    }
  }, [session]);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/admin/courses/pending');
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      } else {
        showToast.error('Erreur lors du chargement des formations');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      showToast.error('Erreur lors du chargement des formations');
    }
  };

  const handleApproveClick = (courseId: string) => {
    setConfirmDialog({
      isOpen: true,
      type: 'approve',
      courseId,
    });
  };

  const handleRejectClick = (courseId: string) => {
    setConfirmDialog({
      isOpen: true,
      type: 'reject',
      courseId,
    });
  };

  const handleConfirm = async () => {
    if (!confirmDialog.courseId || !confirmDialog.type) return;

    setLoading(true);
    setConfirmDialog({ isOpen: false, type: null, courseId: null });

    const action = confirmDialog.type === 'approve' ? 'approve' : 'reject';
    const loadingMessage = confirmDialog.type === 'approve' ? 'Approbation en cours...' : 'Rejet en cours...';
    const successMessage = confirmDialog.type === 'approve' ? 'Formation approuvée avec succès' : 'Formation rejetée';

    showToast.loading(loadingMessage);

    try {
      const response = await fetch(`/api/admin/courses/${confirmDialog.courseId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        showToast.success(successMessage);
        await fetchCourses();
      } else {
        const data = await response.json();
        showToast.error(data.message || `Erreur lors de l'${action === 'approve' ? 'approbation' : 'rejet'}`);
      }
    } catch (error) {
      showToast.error(`Erreur lors de l'${action === 'approve' ? 'approbation' : 'rejet'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    if (!loading) {
      setConfirmDialog({ isOpen: false, type: null, courseId: null });
    }
  };

  const getConfirmDialogProps = () => {
    if (confirmDialog.type === 'approve') {
      return {
        title: 'Approuver la formation',
        message: 'Êtes-vous sûr de vouloir approuver cette formation ? Elle sera alors visible par tous les apprenants.',
        confirmText: 'Approuver',
        variant: 'success' as const,
      };
    } else if (confirmDialog.type === 'reject') {
      return {
        title: 'Rejeter la formation',
        message: 'Êtes-vous sûr de vouloir rejeter cette formation ? Cette action peut être annulée plus tard.',
        confirmText: 'Rejeter',
        variant: 'danger' as const,
      };
    }
    return {
      title: '',
      message: '',
      confirmText: 'Confirmer',
      variant: 'warning' as const,
    };
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
    { label: 'Gestion Rôles', href: '/admin/roles', icon: <FiCheckCircle className="w-5 h-5" />, permission: PERMISSIONS.ROLE_READ },
  ];

  // Vérifier que l'utilisateur est un admin
  if (user && user.role?.name !== 'admin') {
    router.push('/dashboard');
    return null;
  }

  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.COURSE_READ}>
      <Head>
        <title>Validation des Formations - Admin</title>
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
                  <FiCheckCircle className="text-blue-600" />
                  <span>Validation des Formations</span>
                </h1>
                <p className="text-gray-600 mt-1">Approuvez ou rejetez les formations soumises par les formateurs</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <Card key={course._id} hover className="border-l-4 border-l-yellow-500 flex flex-col h-full">
                    {/* Header */}
                    <div className="mb-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold text-gray-900 flex-1 leading-tight pr-2">{course.title}</h3>
                        <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full whitespace-nowrap">
                          En attente
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">{course.description}</p>
                    </div>
                    
                    {/* Informations principales */}
                    <div className="mb-6 space-y-4">
                      {/* Formateur */}
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-500">Formateur</span>
                        <span className="text-sm font-semibold text-gray-900">{course.instructor?.firstName} {course.instructor?.lastName}</span>
                      </div>

                      {/* Prix */}
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-500">Prix</span>
                        <span className="text-lg font-bold text-blue-600">{course.price} MRU</span>
                      </div>

                      {/* Catégorie */}
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-500">Catégorie</span>
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">{course.category}</span>
                      </div>
                    </div>

                    {/* Ressources */}
                    {course.resources && (
                      <div className="mb-6 pb-6 border-b border-gray-200">
                        <div className="flex flex-wrap gap-3">
                          {course.resources.pdfs?.length > 0 && (
                            <div className="flex items-center space-x-2 px-3 py-1.5 bg-red-50 rounded-lg">
                              <FiFileText className="w-4 h-4 text-red-600" />
                              <span className="text-sm font-medium text-gray-700">{course.resources.pdfs.length} PDF</span>
                            </div>
                          )}
                          {course.resources.videos?.length > 0 && (
                            <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 rounded-lg">
                              <FiVideo className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-gray-700">{course.resources.videos.length} Vidéos</span>
                            </div>
                          )}
                          {course.resources.quizzes?.length > 0 && (
                            <div className="flex items-center space-x-2 px-3 py-1.5 bg-purple-50 rounded-lg">
                              <FiHelpCircle className="w-4 h-4 text-purple-600" />
                              <span className="text-sm font-medium text-gray-700">{course.resources.quizzes.length} Quiz</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions - Boutons */}
                    <div className="mt-auto pt-4 space-y-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/courses/${course._id}`)}
                        className="w-full flex items-center justify-center space-x-2 border-2 hover:bg-gray-50"
                      >
                        <FiEye className="w-4 h-4" />
                        <span>Voir les détails</span>
                      </Button>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleApproveClick(course._id)}
                          disabled={loading || course.isApproved}
                          className="flex items-center justify-center space-x-2"
                        >
                          <FiCheckCircle className="w-4 h-4" />
                          <span>Approuver</span>
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRejectClick(course._id)}
                          disabled={loading}
                          className="flex items-center justify-center space-x-2"
                        >
                          <FiXCircle className="w-4 h-4" />
                          <span>Rejeter</span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {courses.length === 0 && (
                <Card className="text-center py-12">
                  <FaGraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Aucune formation en attente de validation</p>
                </Card>
              )}
            </div>
          </main>
        </div>

        {/* Confirmation Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={handleCloseDialog}
          onConfirm={handleConfirm}
          isLoading={loading}
          {...getConfirmDialogProps()}
        />
      </div>
    </ProtectedRoute>
  );
}

