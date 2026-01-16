import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { 
  FiBook, FiUsers, FiAward, FiPlayCircle, FiCheckCircle, 
  FiStar, FiArrowRight, FiTrendingUp, FiShield, FiClock,
  FiVideo, FiFileText, FiHelpCircle, FiBarChart2, FiX
} from 'react-icons/fi';
import { 
  FaGraduationCap, FaChalkboardTeacher, FaUserGraduate, 
  FaRocket, FaLaptopCode, FaChartLine, FaCertificate
} from 'react-icons/fa';
import { HiAcademicCap, HiLightBulb } from 'react-icons/hi';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { normalizeMediaUrl } from '../lib/utils/url';

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
  resources?: {
    pdfs: string[];
    videos: string[];
    quizzes: string[];
  };
  createdAt: string;
}

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]); // Toutes les formations pour le filtrage
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/courses');
      if (response.ok) {
        const data = await response.json();
        setAllCourses(data);
        setCourses(data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les formations par catégorie
  useEffect(() => {
    if (selectedCategory) {
      const filtered = allCourses.filter(course => 
        course.category.toLowerCase() === selectedCategory.toLowerCase()
      );
      setCourses(filtered);
    } else {
      setCourses(allCourses);
    }
  }, [selectedCategory, allCourses]);

  const handleCategoryClick = (categoryName: string) => {
    if (selectedCategory === categoryName) {
      // Si la catégorie est déjà sélectionnée, la désélectionner
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryName);
      // Scroll vers les formations
      setTimeout(() => {
        document.getElementById('courses-section')?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  };

  const handleOpenModal = (course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };

  const handleBuyNow = () => {
    if (!selectedCourse) return;

    // Vérifier si l'utilisateur est connecté
    if (status === 'authenticated' && session) {
      // Utilisateur connecté → rediriger vers la page de paiement
      handleCloseModal();
      router.push(`/payment?courseId=${selectedCourse._id}`);
    } else {
      // Utilisateur non connecté → rediriger vers la page de connexion avec returnUrl
      handleCloseModal();
      const returnUrl = encodeURIComponent(`/payment?courseId=${selectedCourse._id}`);
      router.push(`/login?returnUrl=${returnUrl}`);
    }
  };

  const handleAddToCart = () => {
    // TODO: Implémenter la logique d'ajout au panier
    console.log('Ajouter au panier:', selectedCourse);
    // Ajouter au panier et peut-être afficher une notification
    handleCloseModal();
  };
  const features = [
    {
      icon: <FiVideo className="w-8 h-8" />,
      title: 'Vidéos Interactives',
      description: 'Apprenez avec des vidéos de qualité professionnelle',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: <FiFileText className="w-8 h-8" />,
      title: 'Ressources PDF',
      description: 'Téléchargez des PDFs pour approfondir vos connaissances',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: <FiHelpCircle className="w-8 h-8" />,
      title: 'Quiz Interactifs',
      description: 'Testez vos connaissances avec des quiz personnalisés',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      icon: <FiBarChart2 className="w-8 h-8" />,
      title: 'Suivi de Progression',
      description: 'Suivez votre avancement en temps réel',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      icon: <FaChalkboardTeacher className="w-8 h-8" />,
      title: 'Formateurs Experts',
      description: 'Apprenez auprès de professionnels expérimentés',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      icon: <FaCertificate className="w-8 h-8" />,
      title: 'Certificats',
      description: 'Obtenez des certificats de complétion reconnus',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  const stats = [
    { number: '10,000+', label: 'Apprenants actifs', icon: <FaUserGraduate className="w-6 h-6" /> },
    { number: '500+', label: 'Formations disponibles', icon: <FiBook className="w-6 h-6" /> },
    { number: '200+', label: 'Formateurs experts', icon: <FaChalkboardTeacher className="w-6 h-6" /> },
    { number: '95%', label: 'Taux de satisfaction', icon: <FiStar className="w-6 h-6" /> },
  ];

  const categories = [
    { name: 'Développement Web', icon: <FaLaptopCode className="w-6 h-6" />, color: 'bg-blue-500' },
    { name: 'Data Science', icon: <FaChartLine className="w-6 h-6" />, color: 'bg-green-500' },
    { name: 'Design', icon: <HiLightBulb className="w-6 h-6" />, color: 'bg-purple-500' },
    { name: 'Marketing', icon: <FiTrendingUp className="w-6 h-6" />, color: 'bg-orange-500' },
    { name: 'Business', icon: <HiAcademicCap className="w-6 h-6" />, color: 'bg-indigo-500' },
    { name: 'Photographie', icon: <FiAward className="w-6 h-6" />, color: 'bg-pink-500' },
  ];

  return (
    <>
      <Head>
        <title>Easy Tech - Apprenez en ligne avec les meilleurs formateurs</title>
        <meta name="description" content="Plateforme d'apprentissage en ligne avec des formations de qualité, des formateurs experts et un suivi de progression personnalisé." />
      </Head>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg p-2">
                  <FaGraduationCap className="text-2xl text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Easy Tech
                </span>
              </div>
              
              <div className="hidden md:flex items-center space-x-8">
                <Link href="#features" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  Fonctionnalités
                </Link>
                <Link href="#categories" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  Catégories
                </Link>
                <Link href="#about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  À propos
                </Link>
              </div>

              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm text-gray-700 hover:text-blue-600 transition-colors font-medium"
                >
                  Connexion
                </Link>
                <Link href="/register">
                  <Button variant="primary" className="flex items-center space-x-2">
                    <span>Commencer</span>
                    <FiArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-20 pb-32">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          {/* Decorative animated blobs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-medium">
                  <FaRocket className="w-4 h-4" />
                  <span>Plateforme #1 d'apprentissage en ligne</span>
                </div>
                
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                  Apprenez sans limites avec{' '}
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Easy Tech
                  </span>
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed">
                  Accédez à des milliers de formations de qualité, enseignées par des experts. 
                  Développez vos compétences et atteignez vos objectifs professionnels.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/register">
                    <Button variant="primary" size="lg" className="flex items-center space-x-2 group">
                      <span>Commencer gratuitement</span>
                      <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/courses">
                    <Button variant="outline" size="lg" className="flex items-center space-x-2">
                      <FiPlayCircle className="w-5 h-5" />
                      <span>Explorer les formations</span>
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center space-x-8 pt-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 border-2 border-white"></div>
                      ))}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">10,000+</p>
                      <p className="text-xs text-gray-600">Apprenants actifs</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <FiStar key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                    <span className="ml-2 text-sm font-medium text-gray-700">4.9/5</span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="relative z-10">
                  <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 rounded-full p-3">
                          <FaGraduationCap className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Formation Complète</h3>
                          <p className="text-sm text-gray-600">Développement Web</p>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full w-3/4"></div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progression</span>
                        <span className="font-semibold text-blue-600">75%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute top-8 left-8 w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl opacity-20 blur-xl"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-4 text-blue-600">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Courses Section */}
        <section id="courses-section" className="py-24 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {selectedCategory ? (
                  <>
                    Formations <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{selectedCategory}</span>
                  </>
                ) : (
                  <>
                    Formations <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Populaires</span>
                  </>
                )}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {selectedCategory 
                  ? `Découvrez toutes nos formations dans la catégorie ${selectedCategory}`
                  : 'Découvrez nos formations les plus appréciées par nos apprenants'
                }
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Chargement des formations...</p>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                  <FiBook className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {selectedCategory ? `Aucune formation dans la catégorie "${selectedCategory}"` : 'Aucune formation disponible'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {selectedCategory 
                    ? 'Essayez une autre catégorie ou consultez toutes nos formations'
                    : 'Revenez bientôt pour découvrir nos nouvelles formations'
                  }
                </p>
                {selectedCategory && (
                  <Button
                    variant="outline"
                    onClick={() => setSelectedCategory(null)}
                    className="inline-flex items-center space-x-2"
                  >
                    <span>Voir toutes les formations</span>
                    <FiArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {courses.map((course) => (
                  <div key={course._id} className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 h-full flex flex-col border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1">
                      {/* Thumbnail Section */}
                      <div className="relative h-52 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 overflow-hidden">
                        {course.thumbnail ? (
                          <>
                            <img 
                              src={normalizeMediaUrl(course.thumbnail)} 
                              alt={course.title}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600">
                            <FaGraduationCap className="w-24 h-24 text-white opacity-30" />
                          </div>
                        )}
                        
                        {/* Overlay with play button on hover */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="transform scale-90 group-hover:scale-100 transition-transform duration-300">
                            <div className="w-16 h-16 bg-white/95 rounded-full flex items-center justify-center shadow-2xl">
                              <FiPlayCircle className="w-8 h-8 text-blue-600" />
                            </div>
                          </div>
                        </div>

                        {/* Category Badge */}
                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1.5 text-xs font-semibold bg-white/95 backdrop-blur-sm text-blue-700 rounded-full shadow-lg">
                            {course.category}
                          </span>
                        </div>

                        {/* Level Badge */}
                        <div className="absolute top-3 right-3">
                          <span className={`px-3 py-1.5 text-xs font-semibold rounded-full shadow-lg backdrop-blur-sm ${
                            course.level === 'beginner' 
                              ? 'bg-green-500/90 text-white' 
                              : course.level === 'intermediate'
                              ? 'bg-yellow-500/90 text-white'
                              : 'bg-red-500/90 text-white'
                          }`}>
                            {course.level === 'beginner' ? 'Débutant' : course.level === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
                          </span>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-5 flex-1 flex flex-col">
                        {/* Title */}
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200 leading-snug">
                          {course.title}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1 leading-relaxed">
                          {course.description}
                        </p>

                        {/* Instructor */}
                        <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-gray-100">
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md ring-2 ring-white">
                              {course.instructor?.firstName?.[0]}{course.instructor?.lastName?.[0]}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {course.instructor?.firstName} {course.instructor?.lastName}
                            </p>
                            <p className="text-xs text-gray-500">Formateur</p>
                          </div>
                        </div>

                        {/* Stats Row */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            {course.resources?.videos && course.resources.videos.length > 0 && (
                              <div className="flex items-center space-x-1.5 text-gray-600">
                                <div className="p-1.5 bg-blue-50 rounded-lg">
                                  <FiVideo className="w-3.5 h-3.5 text-blue-600" />
                                </div>
                                <span className="text-xs font-medium">{course.resources.videos.length}</span>
                              </div>
                            )}
                            {course.resources?.pdfs && course.resources.pdfs.length > 0 && (
                              <div className="flex items-center space-x-1.5 text-gray-600">
                                <div className="p-1.5 bg-purple-50 rounded-lg">
                                  <FiFileText className="w-3.5 h-3.5 text-purple-600" />
                                </div>
                                <span className="text-xs font-medium">{course.resources.pdfs.length}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-1.5 text-gray-600">
                            <div className="p-1.5 bg-orange-50 rounded-lg">
                              <FiClock className="w-3.5 h-3.5 text-orange-600" />
                            </div>
                            <span className="text-xs font-medium">{course.duration}h</span>
                          </div>
                        </div>

                        {/* Price & CTA */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-baseline space-x-1">
                            <span className="text-2xl font-extrabold text-gray-900">
                              {course.price}
                            </span>
                            <span className="text-sm font-medium text-gray-500">MRU</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenModal(course);
                            }}
                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors group/btn"
                          >
                            <span className="text-sm font-semibold">
                              Découvrir
                            </span>
                            <FiArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-200" />
                          </button>
                        </div>
                      </div>

                      {/* Hover Border Effect */}
                      <div className="absolute inset-0 border-2 border-blue-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                ))}
              </div>
            )}

            {courses.length > 0 && (
              <div className="text-center mt-12">
                <Link href="/courses">
                  <Button variant="outline" size="lg" className="flex items-center space-x-2 mx-auto">
                    <span>Voir toutes les formations</span>
                    <FiArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Pourquoi choisir <span className="text-blue-600">Easy Tech</span> ?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Une expérience d'apprentissage complète avec tous les outils dont vous avez besoin pour réussir
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} hover className="border-0 shadow-lg">
                  <div className={`inline-flex items-center justify-center w-16 h-16 ${feature.bgColor} rounded-xl mb-6 ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section id="categories" className="py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Explorez nos <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">catégories</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Trouvez la formation parfaite pour développer vos compétences
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
              {categories.map((category, index) => {
                const isSelected = selectedCategory === category.name;
                return (
                  <button
                    key={index}
                    onClick={() => handleCategoryClick(category.name)}
                    className={`
                      relative group text-center p-6 rounded-2xl border-2 transition-all duration-300
                      ${isSelected 
                        ? 'border-blue-500 bg-blue-50 shadow-lg scale-105' 
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md hover:scale-105'
                      }
                    `}
                  >
                    <div className={`
                      inline-flex items-center justify-center w-16 h-16 ${category.color} rounded-xl mb-4 text-white
                      transition-transform duration-300
                      ${isSelected ? 'scale-110 ring-4 ring-blue-200' : 'group-hover:scale-110'}
                    `}>
                      {category.icon}
                    </div>
                    <h3 className={`
                      font-semibold transition-colors duration-300
                      ${isSelected ? 'text-blue-600' : 'text-gray-900 group-hover:text-blue-600'}
                    `}>
                      {category.name}
                    </h3>
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Badge de catégorie sélectionnée */}
            {selectedCategory && (
              <div className="mt-8 flex justify-center">
                <div className="inline-flex items-center space-x-3 px-6 py-3 bg-blue-100 border-2 border-blue-300 rounded-full">
                  <span className="text-sm font-medium text-blue-900">
                    Filtré par: <span className="font-bold">{selectedCategory}</span>
                  </span>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <FaGraduationCap className="w-16 h-16 text-white mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-4">
              Prêt à commencer votre parcours d'apprentissage ?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Rejoignez des milliers d'apprenants qui développent leurs compétences avec Easy Tech
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button variant="primary" size="lg" className="bg-white text-blue-600 hover:bg-gray-100 flex items-center space-x-2">
                  <span>Créer un compte gratuit</span>
                  <FiArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/courses">
                <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-blue-600">
                  Voir les formations
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-300 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <FaGraduationCap className="text-2xl text-blue-400" />
                  <span className="text-xl font-bold text-white">Easy Tech</span>
                </div>
                <p className="text-sm text-gray-400">
                  La plateforme d'apprentissage en ligne pour développer vos compétences et atteindre vos objectifs.
                </p>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-4">Navigation</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/courses" className="hover:text-blue-400 transition-colors">Formations</Link></li>
                  <li><Link href="#features" className="hover:text-blue-400 transition-colors">Fonctionnalités</Link></li>
                  <li><Link href="#categories" className="hover:text-blue-400 transition-colors">Catégories</Link></li>
                  <li><Link href="/register" className="hover:text-blue-400 transition-colors">S'inscrire</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="#" className="hover:text-blue-400 transition-colors">Centre d'aide</Link></li>
                  <li><Link href="#" className="hover:text-blue-400 transition-colors">Contact</Link></li>
                  <li><Link href="#" className="hover:text-blue-400 transition-colors">FAQ</Link></li>
                  <li><Link href="#" className="hover:text-blue-400 transition-colors">Politique de confidentialité</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">Suivez-nous</h4>
                <div className="flex space-x-4">
                  <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                    <FiUsers className="w-5 h-5" />
                  </div>
                  <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                    <FiTrendingUp className="w-5 h-5" />
                  </div>
                  <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                    <FiAward className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
              <p>&copy; 2024 Easy Tech. Tous droits réservés.</p>
            </div>
          </div>
        </footer>

        {/* Course Detail Modal */}
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} size="xl">
          {selectedCourse && (
            <div className="relative max-h-[90vh] overflow-y-auto">
              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg flex items-center justify-center transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-600" />
              </button>

              {/* Course Image/Thumbnail */}
              <div className="relative h-64 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 overflow-hidden -mx-6 -mt-4 mb-6">
                {selectedCourse.thumbnail ? (
                  <>
                    <img 
                      src={normalizeMediaUrl(selectedCourse.thumbnail)} 
                      alt={selectedCourse.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaGraduationCap className="w-32 h-32 text-white opacity-50" />
                  </div>
                )}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="px-3 py-1.5 text-xs font-semibold bg-white/95 backdrop-blur-sm text-blue-700 rounded-full">
                      {selectedCourse.category}
                    </span>
                    <span className={`px-3 py-1.5 text-xs font-semibold rounded-full backdrop-blur-sm ${
                      selectedCourse.level === 'beginner' 
                        ? 'bg-green-500/90 text-white' 
                        : selectedCourse.level === 'intermediate'
                        ? 'bg-yellow-500/90 text-white'
                        : 'bg-red-500/90 text-white'
                    }`}>
                      {selectedCourse.level === 'beginner' ? 'Débutant' : selectedCourse.level === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Title and Price Row */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pb-6 border-b border-gray-200">
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
                      {selectedCourse.title}
                    </h2>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      {selectedCourse.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-4xl font-extrabold text-gray-900">
                        {selectedCourse.price}
                      </span>
                      <span className="text-lg font-medium text-gray-500">MRU</span>
                    </div>
                  </div>
                </div>

                {/* Course Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-gray-200">
                  {selectedCourse.resources?.videos && selectedCourse.resources.videos.length > 0 && (
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <FiVideo className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{selectedCourse.resources.videos.length}</div>
                        <div className="text-sm text-gray-600">Vidéos</div>
                      </div>
                    </div>
                  )}
                  {selectedCourse.resources?.pdfs && selectedCourse.resources.pdfs.length > 0 && (
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-purple-100 rounded-xl">
                        <FiFileText className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{selectedCourse.resources.pdfs.length}</div>
                        <div className="text-sm text-gray-600">PDFs</div>
                      </div>
                    </div>
                  )}
                  {selectedCourse.resources?.quizzes && selectedCourse.resources.quizzes.length > 0 && (
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-orange-100 rounded-xl">
                        <FiHelpCircle className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{selectedCourse.resources.quizzes.length}</div>
                        <div className="text-sm text-gray-600">Quiz</div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-indigo-100 rounded-xl">
                      <FiClock className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{selectedCourse.duration}</div>
                      <div className="text-sm text-gray-600">Heures</div>
                    </div>
                  </div>
                </div>

                {/* Instructor Section */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">À propos du formateur</h3>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                        {selectedCourse.instructor?.firstName?.[0]}{selectedCourse.instructor?.lastName?.[0]}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {selectedCourse.instructor?.firstName} {selectedCourse.instructor?.lastName}
                      </h4>
                      <p className="text-gray-600 mb-2">Formateur Expert</p>
                      <p className="text-sm text-gray-500">{selectedCourse.instructor?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Course Features */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Ce que vous allez apprendre</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedCourse.resources?.videos && selectedCourse.resources.videos.length > 0 && (
                      <div className="flex items-start space-x-3">
                        <FiCheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{selectedCourse.resources.videos.length} vidéos interactives de qualité</span>
                      </div>
                    )}
                    {selectedCourse.resources?.pdfs && selectedCourse.resources.pdfs.length > 0 && (
                      <div className="flex items-start space-x-3">
                        <FiCheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{selectedCourse.resources.pdfs.length} ressources PDF téléchargeables</span>
                      </div>
                    )}
                    {selectedCourse.resources?.quizzes && selectedCourse.resources.quizzes.length > 0 && (
                      <div className="flex items-start space-x-3">
                        <FiCheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{selectedCourse.resources.quizzes.length} quiz pour tester vos connaissances</span>
                      </div>
                    )}
                    <div className="flex items-start space-x-3">
                      <FiCheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Accès à vie au contenu de la formation</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <FiCheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Certificat de complétion</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <FiCheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Support et assistance du formateur</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleBuyNow}
                    className="flex-1 flex items-center justify-center space-x-2 py-4 text-lg font-semibold"
                  >
                    <span>Acheter maintenant</span>
                    <FiArrowRight className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center space-x-2 py-4 text-lg font-semibold border-2"
                  >
                    <FiCheckCircle className="w-5 h-5" />
                    <span>Ajouter au panier</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </>
  );
}
