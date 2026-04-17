import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  FiArrowLeft,
  FiClock,
  FiTag,
  FiVideo,
  FiFileText,
  FiHelpCircle,
  FiLock,
  FiPlay,
  FiDownload,
} from 'react-icons/fi';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import Logo from '../../components/ui/Logo';
import { useSession, signOut } from 'next-auth/react';
import { normalizeMediaUrl } from '../../lib/utils/url';
import { showToast } from '../../lib/toast';

interface LessonItem {
  _id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  duration?: number;
  order?: number;
}

interface QuizRef {
  _id: string;
  title: string;
}

interface CourseResources {
  pdfs: string[];
  videos: string[];
  quizzes: QuizRef[] | string[];
}

interface CourseDetail {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  level: string;
  duration?: number;
  thumbnail?: string;
  instructor?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  isEnrolled: boolean;
  lessonCount?: number;
  resourcesPreview?: {
    pdfCount: number;
    videoCount: number;
    quizCount: number;
  };
  lessons?: LessonItem[];
  resources?: CourseResources;
}

function getFileName(url: string): string {
  try {
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const parts = fileName.split('_');
    if (parts.length > 1 && /^\d+$/.test(parts[0])) {
      return parts.slice(1).join('_');
    }
    return decodeURIComponent(fileName);
  } catch {
    return 'Document';
  }
}

function isQuizRef(q: unknown): q is QuizRef {
  return typeof q === 'object' && q !== null && '_id' in q && 'title' in q;
}

export default function CoursePublicPage() {
  const router = useRouter();
  const idParam = router.query.id;
  const id =
    typeof idParam === 'string'
      ? idParam
      : Array.isArray(idParam)
        ? idParam[0]
        : undefined;
  const { data: session, status } = useSession();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady || !id) return;
    /** Attendre la session pour que l’API détecte correctement l’inscription et renvoie leçons / médias */
    if (status === 'loading') return;

    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/courses/${id}`, {
          credentials: 'include',
          cache: 'no-store',
        });
        if (!res.ok) {
          showToast.error('Formation introuvable');
          router.push('/courses');
          return;
        }
        const data = (await res.json()) as CourseDetail;
        setCourse(data);
      } catch {
        showToast.error('Erreur de chargement');
        router.push('/courses');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [router.isReady, id, status, router]);

  const user = session?.user;

  if (!router.isReady || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!id) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <p className="text-gray-700 mb-4">Formation introuvable.</p>
        <Link href="/courses" className="text-blue-600 hover:underline">
          Retour au catalogue
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <p className="text-gray-700 mb-4 text-center">
          Impossible d&apos;afficher les données de cette formation.
        </p>
        <Link href="/courses" className="text-blue-600 hover:underline font-medium">
          Retour au catalogue
        </Link>
      </div>
    );
  }

  const levelLabel =
    course.level === 'beginner'
      ? 'Débutant'
      : course.level === 'intermediate'
        ? 'Intermédiaire'
        : 'Avancé';

  const sortedLessons = [...(course.lessons || [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  const pdfs = course.resources?.pdfs ?? [];
  const resVideos = course.resources?.videos ?? [];
  const quizzesRaw = course.resources?.quizzes ?? [];
  const quizzes = quizzesRaw.filter(isQuizRef) as QuizRef[];

  const goToPayment = () => {
    if (status !== 'authenticated') {
      const ret = encodeURIComponent(`/payment?courseId=${course._id}`);
      router.push(`/login?returnUrl=${ret}`);
      return;
    }
    router.push(`/payment?courseId=${course._id}`);
  };

  return (
    <>
      <Head>
        <title>{course.title} — itkane</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <Header
          user={
            user
              ? {
                  firstName: user.firstName || '',
                  lastName: user.lastName || '',
                  role: { name: user.role?.name || '' },
                }
              : undefined
          }
          onLogout={async () => {
            await signOut({ redirect: false });
            router.push('/login');
          }}
        />

        <main className="max-w-4xl mx-auto px-4 py-8 pb-16">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6"
          >
            <FiArrowLeft className="w-5 h-5" />
            Retour aux formations
          </Link>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            <div className="aspect-video bg-gradient-to-br from-blue-500 to-indigo-600 relative">
              {course.thumbnail ? (
                <img
                  src={normalizeMediaUrl(course.thumbnail)}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Logo size="lg" showText={false} className="opacity-40" />
                </div>
              )}
            </div>
            <div className="p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {course.title}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
                <span className="inline-flex items-center gap-1">
                  <FiTag className="w-4 h-4" />
                  {course.category}
                </span>
                <span className="inline-flex items-center gap-1">
                  <FiClock className="w-4 h-4" />
                  {levelLabel}
                  {course.duration != null ? ` · ${course.duration} h` : ''}
                </span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-6">
                {course.description}
              </p>
              {course.instructor && (
                <p className="text-sm text-gray-500 mb-6">
                  Formateur : {course.instructor.firstName}{' '}
                  {course.instructor.lastName}
                </p>
              )}

              {!course.isEnrolled && (
                <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-5 mb-6">
                  <div className="flex items-start gap-3">
                    <FiLock className="w-6 h-6 text-amber-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-900 mb-1">
                        Contenu réservé aux inscrits
                      </p>
                      <p className="text-sm text-amber-800 mb-4">
                        Achetez cette formation pour accéder aux leçons, vidéos,
                        documents PDF et quiz.
                        {course.resourcesPreview && (
                          <span className="block mt-2">
                            Aperçu :{' '}
                            {course.lessonCount ?? 0} leçon(s),{' '}
                            {course.resourcesPreview.videoCount} vidéo(s)
                            ressource, {course.resourcesPreview.pdfCount}{' '}
                            PDF, {course.resourcesPreview.quizCount} quiz.
                          </span>
                        )}
                      </p>
                      <Button variant="primary" onClick={goToPayment}>
                        Acheter — {course.price} MRU
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                onClick={() => router.push('/courses')}
              >
                Catalogue des formations
              </Button>
            </div>
          </div>

          {course.isEnrolled && (
            <div className="space-y-8">
              {sortedLessons.length > 0 && (
                <section className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <FiPlay className="w-6 h-6 text-blue-600" />
                    Leçons
                  </h2>
                  <ol className="space-y-6">
                    {sortedLessons.map((lesson, idx) => (
                      <li
                        key={lesson._id}
                        className="border border-gray-200 rounded-xl p-4 md:p-5"
                      >
                        <p className="text-xs font-semibold text-blue-600 mb-1">
                          Leçon {idx + 1}
                        </p>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {lesson.title}
                        </h3>
                        {lesson.description && (
                          <p className="text-sm text-gray-600 mb-3 whitespace-pre-wrap">
                            {lesson.description}
                          </p>
                        )}
                        {lesson.duration != null && lesson.duration > 0 && (
                          <p className="text-xs text-gray-500 mb-3">
                            Durée estimée : {lesson.duration} min
                          </p>
                        )}
                        {lesson.videoUrl ? (
                          <div className="rounded-lg overflow-hidden bg-black aspect-video max-w-3xl">
                            <video
                              className="w-full h-full"
                              controls
                              playsInline
                              preload="metadata"
                              src={normalizeMediaUrl(lesson.videoUrl)}
                            >
                              Votre navigateur ne supporte pas la lecture
                              vidéo.
                            </video>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">
                            Aucune vidéo pour cette leçon.
                          </p>
                        )}
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {resVideos.length > 0 && (
                <section className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FiVideo className="w-6 h-6 text-blue-600" />
                    Vidéos complémentaires
                  </h2>
                  <ul className="space-y-4">
                    {resVideos.map((url, i) => (
                      <li
                        key={i}
                        className="rounded-xl border border-gray-200 overflow-hidden"
                      >
                        <div className="aspect-video bg-black max-w-3xl">
                          <video
                            className="w-full h-full"
                            controls
                            playsInline
                            preload="metadata"
                            src={normalizeMediaUrl(url)}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {pdfs.length > 0 && (
                <section className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FiFileText className="w-6 h-6 text-purple-600" />
                    Documents PDF
                  </h2>
                  <ul className="space-y-2">
                    {pdfs.map((url, i) => (
                      <li key={i}>
                        <a
                          href={normalizeMediaUrl(url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                        >
                          <FiDownload className="w-4 h-4 flex-shrink-0" />
                          {getFileName(url)}
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {quizzes.length > 0 && (
                <section className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FiHelpCircle className="w-6 h-6 text-orange-600" />
                    Quiz
                  </h2>
                  <ul className="space-y-2">
                    {quizzes.map((q) => (
                      <li
                        key={q._id}
                        className="flex items-center gap-2 text-gray-800 py-2 border-b border-gray-100 last:border-0"
                      >
                        <FiHelpCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                        <span className="font-medium">{q.title}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {sortedLessons.length === 0 &&
                resVideos.length === 0 &&
                pdfs.length === 0 &&
                quizzes.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    Aucune ressource n&apos;a encore été publiée pour ce cours.
                  </p>
                )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
