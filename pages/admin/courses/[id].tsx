import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import { 
  FiArrowLeft, FiFileText, FiVideo, FiDownload, FiPlay, FiClock,
  FiUser, FiTag, FiDollarSign, FiCheckCircle, FiXCircle, FiCalendar,
  FiBarChart2, FiShield
} from 'react-icons/fi';
import { FaBookOpen, FaChalkboardTeacher, FaUserGraduate } from 'react-icons/fa';
import { HiOutlineCollection } from 'react-icons/hi';
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
  duration: number;
  thumbnail?: string;
  isPublished: boolean;
  isApproved: boolean;
  approvedBy?: {
    firstName: string;
    lastName: string;
  };
  approvedAt?: string;
  resources?: {
    pdfs: string[];
    videos: string[];
    quizzes: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export default function CourseDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);

  useEffect(() => {
    if (id && session?.user) {
      fetchCourse();
    }
  }, [id, session]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/courses/${id}`);
      if (response.ok) {
        const data = await response.json();
        setCourse(data);
      } else {
        showToast.error('Erreur lors du chargement de la formation');
        router.push('/admin/courses/all');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      showToast.error('Erreur lors du chargement de la formation');
      router.push('/admin/courses/all');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileName = (url: string): string => {
    try {
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      // Remove timestamp prefix if exists (format: timestamp_filename.pdf)
      const parts = fileName.split('_');
      if (parts.length > 1 && /^\d+$/.test(parts[0])) {
        return parts.slice(1).join('_');
      }
      return decodeURIComponent(fileName);
    } catch {
      return 'Document';
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

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <ProtectedRoute requiredPermission={PERMISSIONS.COURSE_READ}>
        <Head>
          <title>Chargement... - Admin</title>
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
                <Card>
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement de la formation...</p>
                  </div>
                </Card>
              </div>
            </main>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.COURSE_READ}>
      <Head>
        <title>{course.title} - Admin</title>
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
              {/* Header avec bouton retour */}
              <div className="mb-6">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="mb-4"
                >
                  <FiArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
                    <p className="text-gray-600 text-lg">{course.description}</p>
                  </div>
                  <div className="ml-4">
                    {course.isApproved ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <FiCheckCircle className="w-4 h-4 mr-1" />
                        Approuvée
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                        <FiXCircle className="w-4 h-4 mr-1" />
                        En attente
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Informations du cours */}
              <Card className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <FiUser className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Formateur</p>
                      <p className="font-semibold text-gray-900">
                        {course.instructor.firstName} {course.instructor.lastName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <FiTag className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Catégorie</p>
                      <p className="font-semibold text-gray-900">{course.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <FiDollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Prix</p>
                      <p className="font-semibold text-gray-900">{course.price} MRU</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <FiClock className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Durée</p>
                      <p className="font-semibold text-gray-900">{course.duration}h</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Contenu principal avec documents */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Section principale - Lecteur vidéo ou PDF */}
                <div className="lg:col-span-2">
                  {selectedVideo ? (
                    <Card className="mb-6">
                      <div className="aspect-video bg-black rounded-lg overflow-hidden">
                        <video
                          controls
                          className="w-full h-full"
                          src={selectedVideo}
                        >
                          Votre navigateur ne supporte pas la lecture de vidéos.
                        </video>
                      </div>
                      <div className="mt-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {getFileName(selectedVideo)}
                        </h3>
                        <Button
                          variant="outline"
                          onClick={() => handleDownload(selectedVideo, getFileName(selectedVideo))}
                        >
                          <FiDownload className="w-4 h-4 mr-2" />
                          Télécharger la vidéo
                        </Button>
                      </div>
                    </Card>
                  ) : selectedPdf ? (
                    <Card className="mb-6">
                      <div className="bg-gray-100 rounded-lg overflow-hidden" style={{ height: '600px' }}>
                        <iframe
                          src={selectedPdf}
                          className="w-full h-full"
                          title="PDF Viewer"
                        />
                      </div>
                      <div className="mt-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {getFileName(selectedPdf)}
                        </h3>
                        <Button
                          variant="outline"
                          onClick={() => handleDownload(selectedPdf, getFileName(selectedPdf))}
                        >
                          <FiDownload className="w-4 h-4 mr-2" />
                          Télécharger le PDF
                        </Button>
                      </div>
                    </Card>
                  ) : (
                    <Card>
                      <div className="text-center py-12">
                        <FiPlay className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Sélectionnez une vidéo ou un document pour commencer</p>
                      </div>
                    </Card>
                  )}

                  {/* Liste des vidéos */}
                  {course.resources?.videos && course.resources.videos.length > 0 && (
                    <Card>
                      <div className="flex items-center space-x-2 mb-4">
                        <FiVideo className="w-5 h-5 text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-900">
                          Vidéos ({course.resources.videos.length})
                        </h2>
                      </div>
                      <div className="space-y-3">
                        {course.resources.videos.map((video, index) => (
                          <div
                            key={index}
                            onClick={() => {
                              setSelectedVideo(video);
                              setSelectedPdf(null);
                            }}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              selectedVideo === video
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 flex-1">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                  <FiPlay className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 truncate">
                                    {getFileName(video)}
                                  </p>
                                  <p className="text-sm text-gray-500">Vidéo {index + 1}</p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(video, getFileName(video));
                                }}
                              >
                                <FiDownload className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>

                {/* Sidebar - Liste des documents */}
                <div className="lg:col-span-1">
                  {/* Documents PDF */}
                  {course.resources?.pdfs && course.resources.pdfs.length > 0 && (
                    <Card className="mb-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <FiFileText className="w-5 h-5 text-red-600" />
                        <h2 className="text-xl font-semibold text-gray-900">
                          Documents PDF ({course.resources.pdfs.length})
                        </h2>
                      </div>
                      <div className="space-y-3">
                        {course.resources.pdfs.map((pdf, index) => (
                          <div
                            key={index}
                            onClick={() => {
                              setSelectedPdf(pdf);
                              setSelectedVideo(null);
                            }}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              selectedPdf === pdf
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
                                  <FiFileText className="w-4 h-4 text-red-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 truncate text-sm">
                                    {getFileName(pdf)}
                                  </p>
                                  <p className="text-xs text-gray-500">PDF {index + 1}</p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(pdf, getFileName(pdf));
                                }}
                                className="flex-shrink-0"
                              >
                                <FiDownload className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Informations supplémentaires */}
                  <Card>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Niveau</span>
                        <span className="font-medium text-gray-900 capitalize">{course.level}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Statut</span>
                        <span className={`font-medium ${course.isPublished ? 'text-green-600' : 'text-gray-600'}`}>
                          {course.isPublished ? 'Publié' : 'Non publié'}
                        </span>
                      </div>
                      {course.approvedBy && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Approuvé par</span>
                          <span className="font-medium text-gray-900">
                            {course.approvedBy.firstName} {course.approvedBy.lastName}
                          </span>
                        </div>
                      )}
                      {course.approvedAt && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Date d'approbation</span>
                          <span className="font-medium text-gray-900">
                            {new Date(course.approvedAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Créé le</span>
                        <span className="font-medium text-gray-900">
                          {new Date(course.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

