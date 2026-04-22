import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiTag,
  FiVideo,
  FiFileText,
  FiHelpCircle,
  FiLock,
  FiPlay,
  FiDownload,
  FiCheckCircle,
  FiStar,
} from 'react-icons/fi';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
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
  isFree?: boolean;
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

type LessonProgressMap = Record<
  string,
  { maxPercent: number; completed: boolean; lastTime?: number }
>;

interface CourseProgressStore {
  lessons: LessonProgressMap;
  lastLessonId?: string;
}

const PROGRESS_KEY = (courseId: string) => `itkane:courseProgress:${courseId}`;
const RATING_KEY = (courseId: string) => `itkane:courseRating:${courseId}`;

function loadProgress(courseId: string): CourseProgressStore {
  if (typeof window === 'undefined') {
    return { lessons: {} };
  }
  try {
    const raw = localStorage.getItem(PROGRESS_KEY(courseId));
    if (!raw) return { lessons: {} };
    const parsed = JSON.parse(raw) as CourseProgressStore;
    if (!parsed.lessons || typeof parsed.lessons !== 'object') {
      return { lessons: {} };
    }
    return parsed;
  } catch {
    return { lessons: {} };
  }
}

function saveProgress(courseId: string, store: CourseProgressStore) {
  try {
    localStorage.setItem(PROGRESS_KEY(courseId), JSON.stringify(store));
  } catch {
    /* ignore quota */
  }
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

function formatDurationMin(min?: number) {
  if (min == null || min <= 0) return null;
  if (min < 60) return `${Math.round(min)} min`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m > 0 ? `${h} h ${m} min` : `${h} h`;
}

/** Bloc notation (persistance locale — prêt pour une future API) */
function CourseRatingBlock({ courseId }: { courseId: string }) {
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RATING_KEY(courseId));
      if (raw) {
        const j = JSON.parse(raw) as { stars?: number; comment?: string };
        if (typeof j.stars === 'number' && j.stars >= 1 && j.stars <= 5) {
          setStars(j.stars);
          setSaved(true);
        }
        if (typeof j.comment === 'string') setComment(j.comment);
      }
    } catch {
      /* ignore */
    }
  }, [courseId]);

  const persist = (nextStars: number, nextComment: string) => {
    try {
      localStorage.setItem(
        RATING_KEY(courseId),
        JSON.stringify({ stars: nextStars, comment: nextComment, at: Date.now() })
      );
    } catch {
      /* ignore */
    }
  };

  const handleSubmit = () => {
    if (stars < 1) {
      showToast.error('Choisissez une note entre 1 et 5 étoiles.');
      return;
    }
    persist(stars, comment.trim());
    setSaved(true);
    showToast.success('Merci pour votre retour !');
  };

  const display = hover || stars;

  return (
    <section className="rounded-2xl border border-gray-200 bg-gradient-to-br from-platform-200/15 via-white to-platform-400/10 p-6 shadow-sm">
      <h3 className="mb-1 text-lg font-bold text-gray-900">Évaluez cette formation</h3>
      <p className="mb-4 text-sm text-gray-600">
        Votre avis aide les autres apprenants et le formateur à améliorer le contenu.
      </p>
      <div className="mb-4 flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setStars(n)}
            className="rounded-md p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-platform-400"
            aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
          >
            <FiStar
              className={`h-8 w-8 ${
                n <= display
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm font-medium text-gray-700">
          {display > 0 ? `${display}/5` : '—'}
        </span>
      </div>
      <label className="mb-3 block">
        <span className="mb-1 block text-xs font-medium text-gray-500">
          Commentaire (optionnel)
        </span>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Qu’avez-vous apprécié ? Que pourrait-on améliorer ?"
          className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 shadow-inner focus:border-platform-400 focus:outline-none focus:ring-2 focus:ring-platform-400/30"
        />
      </label>
      <Button variant="primary" type="button" onClick={handleSubmit} className="mt-2">
        {saved ? 'Mettre à jour mon avis' : 'Envoyer mon avis'}
      </Button>
    </section>
  );
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
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [progressStore, setProgressStore] = useState<CourseProgressStore>({
    lessons: {},
  });
  const [playbackPercent, setPlaybackPercent] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastProgressPersistRef = useRef(0);

  useEffect(() => {
    if (!router.isReady || !id) return;
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

  const sortedLessons = useMemo(() => {
    if (!course?.lessons) return [];
    return [...course.lessons].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [course?.lessons]);

  useEffect(() => {
    if (!course?._id || !course.isEnrolled) return;
    const store = loadProgress(course._id);
    setProgressStore(store);
    const ids = new Set(sortedLessons.map((l) => l._id));
    if (store.lastLessonId && ids.has(store.lastLessonId)) {
      setActiveLessonId(store.lastLessonId);
    } else if (sortedLessons[0]) {
      setActiveLessonId(sortedLessons[0]._id);
    }
  }, [course?._id, course?.isEnrolled, sortedLessons]);

  const activeLesson = useMemo(
    () => sortedLessons.find((l) => l._id === activeLessonId) ?? null,
    [sortedLessons, activeLessonId]
  );

  const activeIndex = useMemo(
    () => sortedLessons.findIndex((l) => l._id === activeLessonId),
    [sortedLessons, activeLessonId]
  );

  const mergeLessonProgress = useCallback(
    (lessonId: string, patch: Partial<LessonProgressMap[string]>) => {
      if (!course?._id) return;
      setProgressStore((prev) => {
        const prevL = prev.lessons[lessonId] ?? {
          maxPercent: 0,
          completed: false,
        };
        const nextL: LessonProgressMap[string] = { ...prevL, ...patch };
        if (typeof patch.maxPercent === 'number') {
          nextL.maxPercent = Math.max(prevL.maxPercent, patch.maxPercent);
        }
        if (nextL.maxPercent >= 92) {
          nextL.completed = true;
        }
        const next: CourseProgressStore = {
          ...prev,
          lessons: { ...prev.lessons, [lessonId]: nextL },
          lastLessonId: lessonId,
        };
        saveProgress(course._id, next);
        return next;
      });
    },
    [course?._id]
  );

  const completedCount = useMemo(() => {
    return sortedLessons.filter(
      (l) => progressStore.lessons[l._id]?.completed
    ).length;
  }, [sortedLessons, progressStore.lessons]);

  const overallPercent = useMemo(() => {
    if (sortedLessons.length === 0) return 0;
    return Math.round((completedCount / sortedLessons.length) * 100);
  }, [sortedLessons.length, completedCount]);

  const handleVideoTimeUpdate = useCallback(() => {
    const el = videoRef.current;
    const lid = activeLessonId;
    if (!el || !lid || !Number.isFinite(el.duration) || el.duration <= 0) return;
    const pct = Math.min(100, (el.currentTime / el.duration) * 100);
    setPlaybackPercent(pct);
    const now = Date.now();
    if (now - lastProgressPersistRef.current > 450) {
      lastProgressPersistRef.current = now;
      mergeLessonProgress(lid, { maxPercent: pct });
    }
  }, [activeLessonId, mergeLessonProgress]);

  const handleVideoEnded = useCallback(() => {
    if (!activeLessonId) return;
    lastProgressPersistRef.current = Date.now();
    setPlaybackPercent(100);
    mergeLessonProgress(activeLessonId, { completed: true, maxPercent: 100 });
  }, [activeLessonId, mergeLessonProgress]);

  const handleLoadedMetadata = useCallback(() => {
    const el = videoRef.current;
    const lid = activeLessonId;
    if (!el || !lid || !course?._id) return;
    const saved = loadProgress(course._id).lessons[lid]?.lastTime;
    if (
      typeof saved === 'number' &&
      saved > 2 &&
      saved < el.duration - 2
    ) {
      el.currentTime = saved;
    }
  }, [activeLessonId, course?._id]);

  useEffect(() => {
    const el = videoRef.current;
    const lid = activeLessonId;
    if (!el || !lid || !course?._id) return;
    const persistPosition = () => {
      const pct =
        Number.isFinite(el.duration) &&
        el.duration > 0 &&
        Number.isFinite(el.currentTime)
          ? Math.min(100, (el.currentTime / el.duration) * 100)
          : undefined;
      mergeLessonProgress(lid, {
        lastTime: el.currentTime,
        ...(pct !== undefined ? { maxPercent: pct } : {}),
      });
    };
    el.addEventListener('pause', persistPosition);
    el.addEventListener('seeked', persistPosition);
    return () => {
      el.removeEventListener('pause', persistPosition);
      el.removeEventListener('seeked', persistPosition);
    };
  }, [activeLessonId, course?._id, mergeLessonProgress]);

  useEffect(() => {
    lastProgressPersistRef.current = 0;
    setPlaybackPercent(0);
    const lid = activeLessonId;
    if (!lid || !course?._id) return;
    const p = progressStore.lessons[lid]?.maxPercent;
    if (typeof p === 'number') setPlaybackPercent(p);
  }, [activeLessonId, course?._id, progressStore.lessons]);

  const user = session?.user;

  if (!router.isReady || status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-platform-600" />
      </div>
    );
  }

  if (!id) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <p className="mb-4 text-gray-700">Formation introuvable.</p>
        <Link href="/courses" className="text-platform-600 hover:underline">
          Retour au catalogue
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-platform-600" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <p className="mb-4 text-center text-gray-700">
          Impossible d&apos;afficher les données de cette formation.
        </p>
        <Link
          href="/courses"
          className="font-medium text-platform-600 hover:underline"
        >
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

  const goPrevLesson = () => {
    if (activeIndex <= 0) return;
    setActiveLessonId(sortedLessons[activeIndex - 1]._id);
  };

  const goNextLesson = () => {
    if (activeIndex < 0 || activeIndex >= sortedLessons.length - 1) return;
    setActiveLessonId(sortedLessons[activeIndex + 1]._id);
  };

  return (
    <>
      <Head>
        <title>{course.title} — itkane</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
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

        <main className="mx-auto max-w-7xl px-4 py-8 pb-20">
          <Link
            href="/courses"
            className="mb-6 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-platform-600"
          >
            <FiArrowLeft className="h-5 w-5" />
            Retour aux formations
          </Link>

          {/* En-tête formation */}
          <div className="mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
            <div className="relative aspect-video max-h-[320px] bg-gradient-to-br from-platform-800 via-platform-600 to-platform-400 md:aspect-[21/9] md:max-h-none">
              {course.thumbnail ? (
                <img
                  src={normalizeMediaUrl(course.thumbnail)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <FiPlay className="h-20 w-20 text-white/40" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-platform-950/90 via-platform-950/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <h1 className="mb-2 text-2xl font-bold text-white drop-shadow md:text-4xl">
                  {course.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-white/90">
                  <span className="inline-flex items-center gap-1">
                    <FiTag className="h-4 w-4" />
                    {course.category}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <FiClock className="h-4 w-4" />
                    {levelLabel}
                    {course.duration != null ? ` · ${course.duration} h` : ''}
                  </span>
                  {course.isEnrolled && sortedLessons.length > 0 && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
                      <span className="h-2 w-24 overflow-hidden rounded-full bg-white/25">
                        <span
                          className="block h-full rounded-full bg-platform-200 transition-all"
                          style={{ width: `${overallPercent}%` }}
                        />
                      </span>
                      {overallPercent}% complété
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <p className="mb-6 whitespace-pre-wrap leading-relaxed text-gray-700">
                {course.description}
              </p>
              {course.instructor && (
                <p className="mb-6 text-sm text-gray-500">
                  <span className="font-medium text-gray-700">Formateur :</span>{' '}
                  {course.instructor.firstName} {course.instructor.lastName}
                </p>
              )}

              {!course.isEnrolled && (
                <div className="mb-6 rounded-xl border-2 border-amber-200 bg-amber-50 p-5">
                  <div className="flex items-start gap-3">
                    <FiLock className="mt-0.5 h-6 w-6 flex-shrink-0 text-amber-700" />
                    <div>
                      <p className="mb-1 font-semibold text-amber-900">
                        Contenu réservé aux inscrits
                      </p>
                      <p className="mb-4 text-sm text-amber-800">
                        Achetez cette formation pour accéder aux leçons, vidéos,
                        documents PDF et quiz.
                        {course.resourcesPreview && (
                          <span className="mt-2 block">
                            Aperçu : {course.lessonCount ?? 0} leçon(s),{' '}
                            {course.resourcesPreview.videoCount} vidéo(s)
                            ressource, {course.resourcesPreview.pdfCount} PDF,{' '}
                            {course.resourcesPreview.quizCount} quiz.
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

              {!course.isEnrolled && (
                <Button
                  variant="outline"
                  onClick={() => router.push('/courses')}
                >
                  Catalogue des formations
                </Button>
              )}
            </div>
          </div>

          {/* Zone apprenant : lecteur + programme + ressources */}
          {course.isEnrolled && (
            <div className="space-y-10">
              {sortedLessons.length > 0 && (
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                  {/* Lecteur + détail leçon */}
                  <div className="space-y-6 lg:col-span-8 lg:order-2">
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-black shadow-2xl ring-1 ring-black/5">
                      {activeLesson?.videoUrl ? (
                        <>
                          <video
                            key={activeLesson._id}
                            ref={videoRef}
                            className="aspect-video w-full bg-black"
                            controls
                            playsInline
                            preload="metadata"
                            src={normalizeMediaUrl(activeLesson.videoUrl)}
                            onTimeUpdate={handleVideoTimeUpdate}
                            onEnded={handleVideoEnded}
                            onLoadedMetadata={handleLoadedMetadata}
                          >
                            Votre navigateur ne supporte pas la lecture vidéo.
                          </video>
                          <div className="border-t border-gray-800 bg-gray-950 px-4 py-2">
                            <div className="mb-1 flex justify-between text-xs text-gray-400">
                              <span>Progression de la leçon</span>
                              <span className="font-medium text-platform-200">
                                {Math.round(
                                  progressStore.lessons[activeLesson._id]
                                    ?.maxPercent ?? playbackPercent
                                )}
                                %
                              </span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-gray-800">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-platform-600 to-platform-400 transition-[width] duration-300 ease-out"
                                style={{
                                  width: `${Math.round(Math.max(playbackPercent, progressStore.lessons[activeLesson._id]?.maxPercent ?? 0))}%`,
                                }}
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex aspect-video items-center justify-center bg-gray-900 text-gray-400">
                          Aucune vidéo pour cette leçon.
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-platform-600">
                        Leçon {activeIndex + 1} sur {sortedLessons.length}
                      </p>
                      <h2 className="mb-3 text-xl font-bold text-gray-900 md:text-2xl">
                        {activeLesson?.title ?? 'Leçon'}
                      </h2>
                      {activeLesson?.description && (
                        <p className="mb-6 whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
                          {activeLesson.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-3">
                        <Button
                          variant="outline"
                          type="button"
                          disabled={activeIndex <= 0}
                          onClick={goPrevLesson}
                          className="inline-flex items-center gap-2"
                        >
                          <FiChevronLeft className="h-5 w-5" />
                          Précédent
                        </Button>
                        <Button
                          variant="primary"
                          type="button"
                          disabled={activeIndex >= sortedLessons.length - 1}
                          onClick={goNextLesson}
                          className="inline-flex items-center gap-2"
                        >
                          Suivant
                          <FiChevronRight className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>

                    <CourseRatingBlock courseId={course._id} />
                  </div>

                  {/* Programme (sidebar) */}
                  <aside className="lg:col-span-4 lg:order-1">
                    <div className="sticky top-24 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
                      <div className="bg-gradient-to-r from-platform-950 via-platform-800 to-platform-600 px-4 py-4 text-white">
                        <h2 className="text-lg font-bold">Programme du cours</h2>
                        <p className="mt-1 text-sm text-white/85">
                          {completedCount}/{sortedLessons.length} leçons terminées
                        </p>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
                          <div
                            className="h-full rounded-full bg-platform-200 transition-all duration-500"
                            style={{ width: `${overallPercent}%` }}
                          />
                        </div>
                      </div>
                      <ul className="max-h-[70vh] divide-y divide-gray-100 overflow-y-auto overscroll-contain">
                        {sortedLessons.map((lesson, idx) => {
                          const lp = progressStore.lessons[lesson._id];
                          const done = lp?.completed ?? false;
                          const pct = lp?.maxPercent ?? 0;
                          const isActive = lesson._id === activeLessonId;
                          return (
                            <li key={lesson._id}>
                              <button
                                type="button"
                                onClick={() => setActiveLessonId(lesson._id)}
                                className={`flex w-full gap-3 px-4 py-3 text-left transition-colors ${
                                  isActive
                                    ? 'bg-platform-200/25 border-l-4 border-l-platform-600'
                                    : 'border-l-4 border-l-transparent hover:bg-gray-50'
                                }`}
                              >
                                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                                  {done ? (
                                    <FiCheckCircle className="h-5 w-5 text-emerald-500" />
                                  ) : pct > 5 ? (
                                    <span className="text-xs">{Math.round(pct)}%</span>
                                  ) : (
                                    idx + 1
                                  )}
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="line-clamp-2 font-medium text-gray-900">
                                    {lesson.title}
                                  </span>
                                  <span className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                                    <FiPlay className="h-3 w-3 shrink-0" />
                                    {formatDurationMin(lesson.duration) ??
                                      'Vidéo'}
                                  </span>
                                  {!done && pct > 2 && (
                                    <span className="mt-2 block h-1 overflow-hidden rounded-full bg-gray-200">
                                      <span
                                        className="block h-full rounded-full bg-platform-500 transition-all"
                                        style={{
                                          width: `${Math.min(100, Math.round(pct))}%`,
                                        }}
                                      />
                                    </span>
                                  )}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </aside>
                </div>
              )}

              {resVideos.length > 0 && (
                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg md:p-8">
                  <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
                    <FiVideo className="h-7 w-7 text-platform-600" />
                    Vidéos complémentaires
                  </h2>
                  <ul className="grid gap-6 md:grid-cols-2">
                    {resVideos.map((url, i) => (
                      <li
                        key={i}
                        className="overflow-hidden rounded-xl border border-gray-200 bg-black shadow-md"
                      >
                        <div className="aspect-video">
                          <video
                            className="h-full w-full"
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
                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg md:p-8">
                  <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
                    <FiFileText className="h-7 w-7 text-platform-600" />
                    Documents PDF
                  </h2>
                  <ul className="space-y-2">
                    {pdfs.map((url, i) => (
                      <li key={i}>
                        <a
                          href={normalizeMediaUrl(url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 font-medium text-platform-600 hover:text-platform-950"
                        >
                          <FiDownload className="h-4 w-4 flex-shrink-0" />
                          {getFileName(url)}
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {quizzes.length > 0 && (
                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg md:p-8">
                  <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
                    <FiHelpCircle className="h-7 w-7 text-amber-600" />
                    Quiz
                  </h2>
                  <ul className="divide-y divide-gray-100">
                    {quizzes.map((q) => (
                      <li
                        key={q._id}
                        className="flex items-center gap-3 py-3 text-gray-800 first:pt-0 last:pb-0"
                      >
                        <FiHelpCircle className="h-5 w-5 flex-shrink-0 text-amber-500" />
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
                  <p className="py-12 text-center text-gray-500">
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
