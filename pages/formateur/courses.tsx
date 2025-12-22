import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { 
  FiBook, FiCheckCircle, FiXCircle, FiEye, FiEdit, FiTrash2,
  FiSearch, FiFilter, FiFileText, FiVideo, FiPlus, FiClock
} from 'react-icons/fi';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ProtectedRoute from '../../components/protected/ProtectedRoute';
import { PERMISSIONS } from '../../lib/permissions';
import { showToast } from '../../lib/toast';

interface Course {
  _id: string;
  title: string;
  description: string;
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

export default function FormateurCourses() {
  const router = useRouter();
  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending' | 'draft'>('all');

  useEffect(() => {
    if (session?.user) {
      fetchCourses();
    }
  }, [session]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/formateur/courses');
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

  const handleDelete = async (courseId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showToast.success('Formation supprimée avec succès');
        fetchCourses();
      } else {
        showToast.error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      showToast.error('Erreur lors de la suppression');
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'approved') return matchesSearch && course.isApproved;
    if (filterStatus === 'pending') return matchesSearch && !course.isApproved && course.isPublished;
    if (filterStatus === 'draft') return matchesSearch && !course.isPublished;
    return matchesSearch;
  });

  const user = session?.user;

  const sidebarItems = [
    { label: 'Dashboard', href: '/dashboard', icon: <FiBook className="w-5 h-5" /> },
    { label: 'Créer une Formation', href: '/admin/courses/create', icon: <FiPlus className="w-5 h-5" /> },
    { label: 'Mes Formations', href: '/formateur/courses', icon: <FiBook className="w-5 h-5" /> },
  ];

  if (!user) {
    return null;
  }

  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.COURSE_READ}>
      <Head>
        <title>Mes Formations - Easy Tech</title>
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Formations</h1>
                <p className="text-gray-600">Gérez toutes vos formations créées</p>
              </div>

              <div className="mb-6 flex flex-col md:flex-row gap-4">
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
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Toutes</option>
                    <option value="approved">Approuvées</option>
                    <option value="pending">En attente</option>
                    <option value="draft">Brouillons</option>
                  </select>
                  <Button
                    onClick={() => router.push('/admin/courses/create')}
                    variant="primary"
                  >
                    <FiPlus className="mr-2" />
                    Nouvelle Formation
                  </Button>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <div className="h-48 bg-gray-200 rounded"></div>
                    </Card>
                  ))}
                </div>
              ) : filteredCourses.length === 0 ? (
                <Card className="text-center py-12">
                  <FiBook className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune formation</h3>
                  <p className="text-gray-600 mb-4">Vous n'avez pas encore créé de formation</p>
                  <Button
                    onClick={() => router.push('/admin/courses/create')}
                    variant="primary"
                  >
                    <FiPlus className="mr-2" />
                    Créer ma première formation
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => (
                    <Card key={course._id} hover className="flex flex-col">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                              {course.title}
                            </h3>
                            <p className="text-sm text-gray-500 mb-2">{course.category}</p>
                          </div>
                          <div className="ml-2">
                            {course.isApproved ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <FiCheckCircle className="w-3 h-3 mr-1" />
                                Approuvé
                              </span>
                            ) : course.isPublished ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                <FiClock className="w-3 h-3 mr-1" />
                                En attente
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Brouillon
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                          {course.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                          <div className="flex items-center">
                            <FiFileText className="w-4 h-4 mr-1" />
                            {course.resources?.pdfs?.length || 0} PDFs
                          </div>
                          <div className="flex items-center">
                            <FiVideo className="w-4 h-4 mr-1" />
                            {course.resources?.videos?.length || 0} Vidéos
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-blue-600">
                            {course.price} €
                          </span>
                          <span className="text-sm text-gray-500 capitalize">
                            {course.level}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                        <Button
                          onClick={() => router.push(`/admin/courses/${course._id}`)}
                          variant="outline"
                          className="flex-1"
                          size="sm"
                        >
                          <FiEye className="mr-1" />
                          Voir
                        </Button>
                        <Button
                          onClick={() => router.push(`/admin/courses/${course._id}/edit`)}
                          variant="outline"
                          className="flex-1"
                          size="sm"
                        >
                          <FiEdit className="mr-1" />
                          Modifier
                        </Button>
                        <Button
                          onClick={() => handleDelete(course._id)}
                          variant="outline"
                          className="text-red-600 hover:bg-red-50"
                          size="sm"
                        >
                          <FiTrash2 className="mr-1" />
                        </Button>
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

