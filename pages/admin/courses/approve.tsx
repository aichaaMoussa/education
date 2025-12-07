import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FiCheckCircle, FiXCircle, FiEye, FiFileText, FiVideo, FiHelpCircle } from 'react-icons/fi';
import { FaGraduationCap } from 'react-icons/fa';
import Header from '../../../components/layout/Header';
import Sidebar from '../../../components/layout/Sidebar';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
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
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/courses/pending', {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  const handleApprove = async (courseId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir approuver cette formation ?')) {
      return;
    }

    setLoading(true);
    const loadingToast = showToast.loading('Approbation en cours...');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/courses/${courseId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'approve' }),
      });

      if (response.ok) {
        showToast.success('Formation approuvée avec succès');
        await fetchCourses();
      } else {
        const data = await response.json();
        showToast.error(data.message || 'Erreur lors de l\'approbation');
      }
    } catch (error) {
      showToast.error('Erreur lors de l\'approbation');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (courseId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir rejeter cette formation ?')) {
      return;
    }

    setLoading(true);
    const loadingToast = showToast.loading('Rejet en cours...');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/courses/${courseId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'reject' }),
      });

      if (response.ok) {
        showToast.success('Formation rejetée');
        await fetchCourses();
      } else {
        const data = await response.json();
        showToast.error(data.message || 'Erreur lors du rejet');
      }
    } catch (error) {
      showToast.error('Erreur lors du rejet');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const sidebarItems = [
    { label: 'Dashboard', href: '/dashboard', icon: <FiCheckCircle className="w-5 h-5" />, permission: PERMISSIONS.DASHBOARD_VIEW },
    { label: 'Gestion Formateurs', href: '/admin/formateurs', icon: <FiCheckCircle className="w-5 h-5" />, permission: PERMISSIONS.USER_READ },
    { label: 'Gestion Apprenants', href: '/admin/apprenants', icon: <FiCheckCircle className="w-5 h-5" />, permission: PERMISSIONS.USER_READ },
    { label: 'Valider Formations', href: '/admin/courses/approve', icon: <FiCheckCircle className="w-5 h-5" />, permission: PERMISSIONS.COURSE_READ },
    { label: 'Statistiques', href: '/admin/statistics', icon: <FiCheckCircle className="w-5 h-5" />, permission: PERMISSIONS.DASHBOARD_ADMIN },
  ];

  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.COURSE_READ}>
      <Head>
        <title>Validation des Formations - Admin</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <Header user={user} onLogout={handleLogout} />
        <div className="flex">
          <Sidebar items={sidebarItems} userPermissions={user?.role?.permissions || []} />
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
                  <Card key={course._id} hover className="border-l-4 border-l-yellow-500">
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                    </div>
                    
                    <div className="mb-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Formateur:</span>
                        <span className="font-medium">{course.instructor?.firstName} {course.instructor?.lastName}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Prix:</span>
                        <span className="font-bold text-blue-600">{course.price}€</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Catégorie:</span>
                        <span className="font-medium">{course.category}</span>
                      </div>
                    </div>

                    {course.resources && (
                      <div className="mb-4 flex items-center space-x-4 text-sm text-gray-600">
                        {course.resources.pdfs?.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <FiFileText className="w-4 h-4" />
                            <span>{course.resources.pdfs.length} PDF</span>
                          </div>
                        )}
                        {course.resources.videos?.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <FiVideo className="w-4 h-4" />
                            <span>{course.resources.videos.length} Vidéos</span>
                          </div>
                        )}
                        {course.resources.quizzes?.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <FiHelpCircle className="w-4 h-4" />
                            <span>{course.resources.quizzes.length} Quiz</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApprove(course._id)}
                        disabled={loading || course.isApproved}
                        className="flex-1 flex items-center justify-center space-x-1"
                      >
                        <FiCheckCircle className="w-4 h-4" />
                        <span>Approuver</span>
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleReject(course._id)}
                        disabled={loading}
                        className="flex-1 flex items-center justify-center space-x-1"
                      >
                        <FiXCircle className="w-4 h-4" />
                        <span>Rejeter</span>
                      </Button>
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
      </div>
    </ProtectedRoute>
  );
}

