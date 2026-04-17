import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FiSearch, FiFilter, FiX, FiStar, FiClock, FiUsers, FiArrowRight } from 'react-icons/fi';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Logo from '../../components/ui/Logo';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  thumbnail?: string;
  instructor?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  students?: any[];
  duration?: number;
  createdAt?: string | Date;
}

export default function Courses() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 10000 });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'popular'>('newest');
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (status !== 'authenticated') {
      setEnrolledCourseIds([]);
      return;
    }
    fetch('/api/enrollments/me')
      .then((r) => r.json())
      .then((d: { courseIds?: string[] }) =>
        setEnrolledCourseIds(Array.isArray(d.courseIds) ? d.courseIds : [])
      )
      .catch(() => setEnrolledCourseIds([]));
  }, [status]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/courses?all=true');
      if (response.ok) {
        const data = await response.json();
        setAllCourses(data);
        setCourses(data);
        // Calculer la plage de prix maximale
        if (data.length > 0) {
          const prices = data.map((c: Course) => c.price);
          const maxPrice = Math.max(...prices);
          setPriceRange({ min: 0, max: Math.ceil(maxPrice / 100) * 100 });
        }
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Obtenir toutes les catégories uniques
  const categories = Array.from(new Set(allCourses.map(course => course.category))).sort();

  // Filtrer et trier les cours
  useEffect(() => {
    let filtered = [...allCourses];

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par catégorie
    if (selectedCategory) {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    // Filtre par prix
    filtered = filtered.filter(course => 
      course.price >= priceRange.min && course.price <= priceRange.max
    );

    // Tri
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        filtered.sort((a, b) => (b.students?.length || 0) - (a.students?.length || 0));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
    }

    setCourses(filtered);
  }, [searchTerm, selectedCategory, priceRange, sortBy, allCourses]);

  const handleLogout = async () => {
    const { signOut } = await import('next-auth/react');
    await signOut({ redirect: false });
    router.push('/login');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setPriceRange({ min: 0, max: priceRange.max });
    setSortBy('newest');
  };

  const hasActiveFilters = searchTerm || selectedCategory || priceRange.min > 0 || priceRange.max < priceRange.max;

  return (
    <>
      <Head>
        <title>Toutes les Formations - itkane</title>
        <meta name="description" content="Découvrez toutes nos formations en ligne avec filtres par catégorie, prix et recherche" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header 
          user={session?.user ? {
            firstName: session.user.firstName || '',
            lastName: session.user.lastName || '',
            role: { name: session.user.role?.name || '' }
          } : undefined} 
          onLogout={handleLogout} 
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Logo size="md" showText={false} />
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Toutes les Formations</h1>
                <p className="text-gray-600 mt-1">
                  {courses.length} {courses.length === 1 ? 'formation disponible' : 'formations disponibles'}
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher une formation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
              >
                <FiFilter className="w-5 h-5" />
                <span>Filtres</span>
                {hasActiveFilters && (
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    {[searchTerm, selectedCategory, priceRange.min > 0 || priceRange.max < priceRange.max].filter(Boolean).length}
                  </span>
                )}
              </button>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="newest">Plus récentes</option>
                <option value="price-low">Prix croissant</option>
                <option value="price-high">Prix décroissant</option>
                <option value="popular">Plus populaires</option>
              </select>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Catégorie
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          !selectedCategory
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Toutes
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            selectedCategory === category
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Prix : {priceRange.min} - {priceRange.max} MRU
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-4">
                        <input
                          type="range"
                          min="0"
                          max={priceRange.max}
                          value={priceRange.min}
                          onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) })}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium text-gray-600 w-20">
                          Min: {priceRange.min} MRU
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <input
                          type="range"
                          min="0"
                          max={priceRange.max}
                          value={priceRange.max}
                          onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium text-gray-600 w-20">
                          Max: {priceRange.max} MRU
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <button
                      onClick={clearFilters}
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <FiX className="w-4 h-4" />
                      <span>Réinitialiser les filtres</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Courses Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : courses.length === 0 ? (
            <Card className="text-center py-16">
              <div className="flex justify-center mb-4">
                <Logo size="lg" showText={false} className="opacity-30" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Aucune formation trouvée
              </h3>
              <p className="text-gray-600 mb-6">
                {hasActiveFilters
                  ? 'Essayez de modifier vos filtres de recherche'
                  : 'Aucune formation disponible pour le moment'}
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters} variant="primary">
                  Réinitialiser les filtres
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card
                  key={course._id}
                  hover
                  className="group overflow-hidden transition-all duration-300 hover:shadow-2xl"
                >
                  {/* Course Thumbnail */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-500 to-indigo-600 overflow-hidden">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Logo size="lg" showText={false} className="opacity-50" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                      <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-blue-600">
                        {course.category}
                      </span>
                      {enrolledCourseIds.includes(course._id) && (
                        <span className="bg-green-600/95 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Inscrit
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                        course.level === 'beginner' ? 'bg-green-500' :
                        course.level === 'intermediate' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}>
                        {course.level === 'beginner' ? 'Débutant' :
                         course.level === 'intermediate' ? 'Intermédiaire' :
                         'Avancé'}
                      </span>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {course.description}
                    </p>

                    {/* Course Meta */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                      {course.instructor && (
                        <div className="flex items-center space-x-1">
                          <FiUsers className="w-4 h-4" />
                          <span>{course.instructor.firstName} {course.instructor.lastName}</span>
                        </div>
                      )}
                      {course.duration && (
                        <div className="flex items-center space-x-1">
                          <FiClock className="w-4 h-4" />
                          <span>{course.duration}h</span>
                        </div>
                      )}
                      {course.students && (
                        <div className="flex items-center space-x-1">
                          <FiUsers className="w-4 h-4" />
                          <span>{course.students.length} étudiants</span>
                        </div>
                      )}
                    </div>

                    {/* Course Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div>
                        <span className="text-2xl font-bold text-blue-600">
                          {course.price} MRU
                        </span>
                      </div>
                      <Link href={`/courses/${course._id}`}>
                        <Button variant="primary" size="sm" className="group-hover:bg-indigo-600">
                          {enrolledCourseIds.includes(course._id)
                            ? 'Accéder au cours'
                            : 'Voir plus'}
                          <FiArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
