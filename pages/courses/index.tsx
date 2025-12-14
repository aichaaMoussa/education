import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ProtectedRoute from '../../components/protected/ProtectedRoute';
import { PERMISSIONS } from '../../lib/permissions';

export default function Courses() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

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
      // Ici vous pouvez appeler votre API
      // const response = await fetch('/api/courses', {
      //   headers: { Authorization: `Bearer ${token}` },
      // });
      // const data = await response.json();
      // setCourses(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.COURSE_READ}>
      <Head>
        <title>Cours - Easy Tech</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <Header user={user} onLogout={handleLogout} />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Cours disponibles</h1>
            {user?.role?.permissions?.includes(PERMISSIONS.COURSE_CREATE) && (
              <Button
                onClick={() => router.push('admin/courses/create')}
                variant="primary"
              >
                + Créer un cours
              </Button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : courses.length === 0 ? (
            <Card>
              <p className="text-center text-gray-600 py-8">
                Aucun cours disponible pour le moment
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course: any) => (
                <Card key={course._id} hover onClick={() => router.push(`/courses/${course._id}`)}>
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-600 font-bold">{course.price}€</span>
                    <Button variant="outline" size="sm">
                      Voir plus
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

