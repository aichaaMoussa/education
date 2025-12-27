import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import { 
  FiBook, FiCheckCircle, FiXCircle, FiEye, FiEdit, FiTrash2,
  FiSearch, FiFilter, FiFileText, FiVideo, FiHelpCircle,
  FiBarChart2, FiUsers, FiShield
} from 'react-icons/fi';
import { FaBookOpen, FaChalkboardTeacher, FaUserGraduate } from 'react-icons/fa';
import { HiOutlineCollection } from 'react-icons/hi';
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

export default function AllCourses() {
  const router = useRouter();
  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending'>('all');
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    courseId: string | null;
  }>({
    isOpen: false,
    courseId: null,
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchCourses();
    }
  }, [session, filterStatus]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/courses/all');
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      } else {
        showToast.error('Erreur lors du chargement des formations');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      showToast.error('Erreur lors du chargement des formations');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (courseId: string) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/approve`, {
        method: 'POST',
      });
      if (response.ok) {
        showToast.success('Formation approuvée avec succès');
        fetchCourses();
      } else {
        const data = await response.json();
        showToast.error(data.message || 'Erreur lors de l\'approbation');
      }
    } catch (error) {
      showToast.error('Erreur lors de l\'approbation');
    }
  };

  const handleDeleteClick = (courseId: string) => {
    setConfirmDialog({
      isOpen: true,
      courseId,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDialog.courseId) return;

    setDeleting(true);
    setConfirmDialog({ isOpen: false, courseId: null });

    try {
      const response = await fetch(`/api/admin/courses/${confirmDialog.courseId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        showToast.success('Formation supprimée avec succès');
        fetchCourses();
      } else {
        const data = await response.json();
        showToast.error(data.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      showToast.error('Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  const handleCloseDialog = () => {
    if (!deleting) {
      setConfirmDialog({ isOpen: false, courseId: null });
    }
  };

  const user = session?.user;

  const sidebarItems = [
    { label: 'Dashboard', href: '/dashboard', icon: <FiBarChart2 className="w-5 h-5" />, permission: PERMISSIONS.DASHBOARD_VIEW },
    {
      label: 'Gestion de Formation',
      icon: <FaBookOpen className="w-5 h-5" />,
      permission: PERMISSIONS.COURSE_READ,
      children: [
        { label: 'Formations à Valider', href: '/admin/courses/approve', icon: <FiCheckCircle className="w-4 h-4" /> },
        { label: 'Toutes les Formations', href: '/admin/courses/all', icon: <HiOutlineCollection className="w-4 h-4" /> },
      ],
    },
    { label: 'Gestion Formateurs', href: '/admin/formateurs', icon: <FaChalkboardTeacher className="w-5 h-5" />, permission: PERMISSIONS.USER_READ },
    { label: 'Gestion Apprenants', href: '/admin/apprenants', icon: <FaUserGraduate className="w-5 h-5" />, permission: PERMISSIONS.USER_READ },
    { label: 'Statistiques', href: '/admin/statistics', icon: <FiBarChart2 className="w-5 h-5" />, permission: PERMISSIONS.DASHBOARD_ADMIN },
    { label: 'Gestion Rôles', href: '/admin/roles', icon: <FiShield className="w-5 h-5" />, permission: PERMISSIONS.ROLE_READ },
  ];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'approved' && course.isApproved) ||
                         (filterStatus === 'pending' && !course.isApproved);
    return matchesSearch && matchesFilter;
  });

  if (!user) {
    return null;
  }

  // Vérifier que l'utilisateur est un admin
  if (user && user.role?.name !== 'admin') {
    router.push('/dashboard');
    return null;
  }

  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.COURSE_READ}>
      <Head>
        <title>Toutes les Formations - Admin</title>
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Toutes les Formations</h1>
                <p className="text-gray-600">Gérez toutes les formations de la plateforme</p>
              </div>

              {/* Filtres et recherche */}
              <Card className="mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher une formation..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={filterStatus === 'all' ? 'primary' : 'outline'}
                      onClick={() => setFilterStatus('all')}
                    >
                      Toutes
                    </Button>
                    <Button
                      variant={filterStatus === 'approved' ? 'primary' : 'outline'}
                      onClick={() => setFilterStatus('approved')}
                    >
                      Approuvées
                    </Button>
                    <Button
                      variant={filterStatus === 'pending' ? 'primary' : 'outline'}
                      onClick={() => setFilterStatus('pending')}
                    >
                      En attente
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Liste des formations */}
              {loading ? (
                <Card>
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement...</p>
                  </div>
                </Card>
              ) : filteredCourses.length === 0 ? (
                <Card>
                  <div className="text-center py-8">
                    <FiBook className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Aucune formation trouvée</p>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {filteredCourses.map((course) => (
                    <Card key={course._id} hover className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-xl font-semibold text-gray-900">{course.title}</h3>
                            {course.isApproved ? (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                                Approuvée
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                                En attente
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                            <span>Formateur: {course.instructor.firstName} {course.instructor.lastName}</span>
                            <span>•</span>
                            <span>Catégorie: {course.category}</span>
                            <span>•</span>
                            <span>Niveau: {course.level}</span>
                            <span>•</span>
                            <span className="font-semibold text-blue-600">{course.price} MRU</span>
                          </div>
                          <div className="flex gap-2 text-sm text-gray-500">
                            {course.resources?.pdfs && course.resources.pdfs.length > 0 && (
                              <span className="flex items-center gap-1">
                                <FiFileText className="w-4 h-4" />
                                {course.resources.pdfs.length} PDF
                              </span>
                            )}
                            {course.resources?.videos && course.resources.videos.length > 0 && (
                              <span className="flex items-center gap-1">
                                <FiVideo className="w-4 h-4" />
                                {course.resources.videos.length} Vidéos
                              </span>
                            )}
                            {course.resources?.quizzes && course.resources.quizzes.length > 0 && (
                              <span className="flex items-center gap-1">
                                <FiHelpCircle className="w-4 h-4" />
                                {course.resources.quizzes.length} Quiz
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          {!course.isApproved && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleApprove(course._id)}
                            >
                              <FiCheckCircle className="w-4 h-4 mr-1" />
                              Approuver
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/admin/courses/${course._id}`)}
                          >
                            <FiEye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(course._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>

        {/* Confirmation Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={handleCloseDialog}
          onConfirm={handleDeleteConfirm}
          isLoading={deleting}
          title="Supprimer la formation"
          message="Êtes-vous sûr de vouloir supprimer cette formation ? Cette action est irréversible et toutes les données associées seront définitivement supprimées."
          confirmText="Supprimer"
          cancelText="Annuler"
          variant="danger"
        />
      </div>
    </ProtectedRoute>
  );
}

