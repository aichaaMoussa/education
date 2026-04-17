import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import {
  FiBarChart2,
  FiShoppingCart,
  FiTrendingUp,
  FiCpu,
  FiArrowRight,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ProtectedRoute from '../../components/protected/ProtectedRoute';
import { PERMISSIONS } from '../../lib/permissions';
import { showToast } from '../../lib/toast';

type Question = { id: string; question: string; options: string[] };

type ResultPayload = {
  scorePercent: number;
  niveau: string;
  resume: string;
  conseils: string[];
  aiDisabled?: boolean;
  notice?: string;
};

/** Toutes les questions portent sur l’informatique (génération IA + secours intégré). */
const PLACEMENT_DOMAIN = 'Informatique';

export default function TestNiveauPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  const [phase, setPhase] = useState<'intro' | 'loading' | 'test' | 'result'>(
    'intro'
  );
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<ResultPayload | null>(null);

  const startTest = async () => {
    try {
      setPhase('loading');
      const res = await fetch('/api/placement/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ domain: PLACEMENT_DOMAIN }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast.error(
          data.message || 'Impossible de démarrer le test. Réessayez plus tard.'
        );
        setPhase('intro');
        return;
      }
      if (typeof data.notice === 'string' && data.notice) {
        showToast.info(data.notice);
      }
      setSessionId(data.sessionId);
      setQuestions(data.questions || []);
      setAnswers({});
      setPhase('test');
    } catch {
      showToast.error('Erreur réseau');
      setPhase('intro');
    }
  };

  const submitTest = async () => {
    if (!sessionId || questions.length === 0) return;
    const responses = questions.map((q) => answers[q.id]);
    if (responses.some((r) => typeof r !== 'number')) {
      showToast.error('Répondez à toutes les questions.');
      return;
    }
    try {
      setPhase('loading');
      const res = await fetch('/api/placement/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sessionId,
          responses,
          domain: PLACEMENT_DOMAIN,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast.error(data.message || 'Erreur lors de la correction.');
        setPhase('test');
        return;
      }
      setResult({
        scorePercent: data.scorePercent,
        niveau: data.niveau,
        resume: data.resume,
        conseils: data.conseils || [],
        aiDisabled: data.aiDisabled,
        notice: typeof data.notice === 'string' ? data.notice : undefined,
      });
      if (typeof data.notice === 'string' && data.notice) {
        showToast.info(data.notice);
      }
      setPhase('result');
    } catch {
      showToast.error('Erreur réseau');
      setPhase('test');
    }
  };

  const sidebarItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: <FiBarChart2 className="w-5 h-5" />,
      permission: PERMISSIONS.DASHBOARD_VIEW,
    },
    {
      label: 'Mes Formations Achetées',
      href: '/apprenant/courses',
      icon: <FiShoppingCart className="w-5 h-5" />,
      permission: PERMISSIONS.DASHBOARD_VIEW,
    },
    {
      label: 'Test de niveau (IA)',
      href: '/apprenant/test-niveau',
      icon: <FiCpu className="w-5 h-5" />,
      permission: PERMISSIONS.DASHBOARD_VIEW,
    },
    {
      label: 'Ma Progression',
      href: '/apprenant/progress',
      icon: <FiTrendingUp className="w-5 h-5" />,
      permission: PERMISSIONS.DASHBOARD_VIEW,
    },
  ];

  if (!user) return null;

  const niveauColor =
    result?.niveau === 'Avancé'
      ? 'text-green-700 bg-green-50 border-green-200'
      : result?.niveau === 'Intermédiaire'
        ? 'text-amber-800 bg-amber-50 border-amber-200'
        : 'text-blue-800 bg-blue-50 border-blue-200';

  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.DASHBOARD_VIEW}>
      <Head>
        <title>Test de niveau — itkane</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <Header
          user={{
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            role: { name: user.role?.name || '' },
          }}
          onLogout={async () => {
            await signOut({ redirect: false });
            router.push('/login');
          }}
        />
        <div className="flex">
          <Sidebar
            items={sidebarItems}
            userPermissions={(user.role?.permissions || []) as any}
          />
          <main className="flex-1 p-8">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-2 text-sm text-blue-700 font-medium mb-2">
                <FiCpu className="w-4 h-4" />
                Évaluation assistée par IA
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Test de niveau
              </h1>
              <p className="text-gray-600 mb-8">
                Huit questions à choix multiples, toutes liées à
                l’informatique (développement, réseaux, bases de données, web,
                sécurité de base, outils). Les résultats incluent une analyse et
                des conseils pour orienter vos formations IT sur itkane.
              </p>

              {phase === 'intro' && (
                <Card className="p-8 space-y-6">
                  <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-800">
                    <strong>Portée du test :</strong> exclusivement{' '}
                    <span className="font-medium">{PLACEMENT_DOMAIN}</span>{' '}
                    (pas de français, langues ou culture générale hors tech).
                  </div>
                  <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-sm text-blue-900">
                    <strong>Astuce :</strong> prévoyez environ 10 minutes. Une
                    clé API OpenAI doit être configurée sur le serveur (
                    <code className="bg-blue-100 px-1 rounded">OPENAI_API_KEY</code>
                    ) pour la génération et l&apos;analyse détaillée.
                  </div>
                  <Button variant="primary" size="lg" onClick={startTest}>
                    Commencer le test
                    <FiArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Card>
              )}

              {phase === 'loading' && (
                <Card className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
                  <p className="mt-4 text-gray-600">
                    {questions.length === 0
                      ? 'Préparation du questionnaire…'
                      : 'Analyse de vos réponses…'}
                  </p>
                </Card>
              )}

              {phase === 'test' && questions.length > 0 && (
                <div className="space-y-6">
                  {questions.map((q, idx) => (
                    <Card key={q.id} className="p-6">
                      <p className="text-xs font-semibold text-blue-600 mb-2">
                        Question {idx + 1} / {questions.length}
                      </p>
                      <p className="text-gray-900 font-medium mb-4">
                        {q.question}
                      </p>
                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => (
                          <label
                            key={optIdx}
                            className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                              answers[q.id] === optIdx
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name={q.id}
                              className="mt-1"
                              checked={answers[q.id] === optIdx}
                              onChange={() =>
                                setAnswers((prev) => ({
                                  ...prev,
                                  [q.id]: optIdx,
                                }))
                              }
                            />
                            <span className="text-gray-800">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </Card>
                  ))}
                  <Button variant="primary" size="lg" onClick={submitTest}>
                    Terminer et voir mon niveau
                    <FiCheckCircle className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              )}

              {phase === 'result' && result && (
                <div className="space-y-6">
                  <Card className={`p-8 border-2 ${niveauColor}`}>
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      <FiCheckCircle className="w-10 h-10 shrink-0" />
                      <div>
                        <p className="text-sm uppercase tracking-wide opacity-80">
                          Niveau estimé
                        </p>
                        <p className="text-3xl font-bold">{result.niveau}</p>
                      </div>
                      <div className="ml-auto text-right">
                        <p className="text-sm opacity-80">Score</p>
                        <p className="text-2xl font-bold">{result.scorePercent}%</p>
                      </div>
                    </div>
                    <p className="text-gray-800 leading-relaxed">{result.resume}</p>
                  </Card>

                  {result.notice && (
                    <div className="flex gap-2 text-sky-900 bg-sky-50 border border-sky-200 rounded-lg p-4 text-sm">
                      <FiAlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <span>{result.notice}</span>
                    </div>
                  )}

                  {result.aiDisabled && !result.notice && (
                    <div className="flex gap-2 text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
                      <FiAlertCircle className="w-5 h-5 shrink-0" />
                      <span>
                        Analyse hors ligne : vérifiez votre quota OpenAI sur{' '}
                        <a
                          href="https://platform.openai.com/account/billing"
                          className="underline font-medium"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Facturation
                        </a>{' '}
                        ou configurez{' '}
                        <code className="bg-amber-100 px-1 rounded">
                          OPENAI_API_KEY
                        </code>
                        .
                      </span>
                    </div>
                  )}

                  <Card className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Conseils pour la suite
                    </h2>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      {result.conseils.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </Card>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPhase('intro');
                        setResult(null);
                        setQuestions([]);
                        setSessionId(null);
                        setAnswers({});
                      }}
                    >
                      Refaire un test
                    </Button>
                    <Link href="/courses">
                      <Button variant="primary">Voir les formations</Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
