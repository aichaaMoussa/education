'use client';

import React from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import type { QuizTopicOption } from '@/lib/types/gemini-quiz';
import {
  frenchLevel,
  useGeminiQuiz,
} from '@/hooks/useGeminiQuiz';

const TOPICS: QuizTopicOption[] = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'react', label: 'React' },
  { id: 'nodejs', label: 'Node.js' },
  { id: 'networking', label: 'Réseaux' },
  { id: 'security', label: 'Sécurité' },
  { id: 'databases', label: 'Bases de données' },
  { id: 'git', label: 'Git / DevOps de base' },
  { id: 'general', label: 'Informatique générale' },
];

function levelBadgeFr(level: string): string {
  switch (level) {
    case 'beginner':
      return 'Débutant';
    case 'intermediate':
      return 'Intermédiaire';
    case 'advanced':
      return 'Avancé';
    default:
      return level;
  }
}

/**
 * Quiz IT interactif : génération via `/api/generate-question`, explications via `/api/explain`.
 */
export default function GeminiQuiz() {
  const quiz = useGeminiQuiz({ totalQuestions: 10 });

  const isBusy =
    quiz.phase === 'loadingQuestion' || quiz.phase === 'loadingFeedback';

  const isLastQuestion = quiz.questionIndex >= quiz.totalQuestions - 1;

  const primaryLabel =
    quiz.roundStep === 'pick'
      ? 'Valider ma réponse'
      : isLastQuestion
        ? 'Voir mes résultats'
        : 'Question suivante';

  const canSelect =
    quiz.phase === 'playing' && quiz.roundStep === 'pick' && !isBusy;

  return (
    <div className="space-y-6">
      {quiz.error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
        >
          {quiz.error}
        </div>
      )}

      {quiz.phase === 'idle' && (
        <Card className="p-8 space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-800">
              Thématique du test
            </label>
            <select
              value={quiz.topic}
              onChange={(e) => quiz.setTopic(e.target.value)}
              className="w-full max-w-md rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              {TOPICS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            10 questions à choix multiples générées dynamiquement (Google Gemini,
            clé uniquement côté serveur). La difficulté s’adapte après chaque
            bonne ou mauvaise réponse. À la fin, votre pourcentage détermine un
            niveau : Débutant, Intermédiaire ou Avancé.
          </p>
          <Button variant="primary" size="lg" onClick={() => quiz.startQuiz()}>
            Start Quiz
          </Button>
        </Card>
      )}

      {quiz.phase === 'loadingQuestion' && (
        <Card className="p-12 text-center">
          <div
            className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"
            aria-hidden
          />
          <p className="mt-4 text-gray-600">Génération de la question…</p>
        </Card>
      )}

      {(quiz.phase === 'playing' ||
        quiz.phase === 'loadingFeedback') &&
        quiz.current && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
              <div className="font-medium text-slate-800">
                Question{' '}
                <span className="text-blue-700">
                  {quiz.questionIndex + 1}
                </span>{' '}
                / {quiz.totalQuestions}
              </div>
              <div className="flex flex-wrap gap-3 text-slate-700">
                <span>
                  Score :{' '}
                  <strong className="text-slate-900">{quiz.score}</strong> /{' '}
                  {quiz.answeredCount > 0 ? quiz.answeredCount : '—'} (
                  {quiz.answeredCount > 0
                    ? `${quiz.runningPercent}%`
                    : '—'}
                  )
                </span>
                <span className="hidden sm:inline" aria-hidden>
                  |
                </span>
                <span>
                  Niveau cible (adaptatif) :{' '}
                  <strong>{levelBadgeFr(quiz.currentLevel)}</strong>
                </span>
              </div>
            </div>

            {quiz.fallbackNotice && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                {quiz.fallbackNotice}
              </div>
            )}

            <Card className="p-6">
              <p className="text-gray-900 mb-6 text-lg font-medium leading-snug">
                {quiz.current.question}
              </p>

              <div className="space-y-2">
                {quiz.current.choices.map((choice) => {
                  const selected = quiz.selectedChoice === choice;
                  const showResult = quiz.roundStep === 'feedback';
                  const isCorrectChoice =
                    choice.trim() === quiz.current!.answer.trim();
                  const outline = showResult
                    ? isCorrectChoice
                      ? 'border-green-600 bg-green-50'
                      : selected && !isCorrectChoice
                        ? 'border-red-400 bg-red-50'
                        : 'border-gray-200 opacity-80'
                    : selected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300';

                  return (
                    <label
                      key={choice}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-3 transition-colors ${outline} ${
                        canSelect ? '' : 'cursor-default'
                      }`}
                    >
                      <input
                        type="radio"
                        name="mcq"
                        className="mt-1"
                        disabled={!canSelect}
                        checked={selected}
                        onChange={() => quiz.setSelectedChoice(choice)}
                      />
                      <span className="text-gray-800">{choice}</span>
                    </label>
                  );
                })}
              </div>

              {quiz.phase === 'loadingFeedback' && (
                <div className="mt-6 flex items-center gap-2 text-sm text-blue-800">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                  Analyse de votre réponse…
                </div>
              )}

              {quiz.roundStep === 'feedback' && quiz.aiExplanation && (
                <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-950">
                  <p className="mb-1 font-semibold text-blue-900">
                    Feedback IA
                  </p>
                  <p className="leading-relaxed whitespace-pre-wrap">
                    {quiz.aiExplanation}
                  </p>
                  {quiz.lastAnswerCorrect !== null && (
                    <p className="mt-3 font-medium">
                      Résultat :{' '}
                      {quiz.lastAnswerCorrect ? (
                        <span className="text-green-800">Correct</span>
                      ) : (
                        <span className="text-red-700">Incorrect</span>
                      )}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  isLoading={
                    quiz.phase === 'loadingFeedback' && quiz.roundStep === 'pick'
                  }
                  disabled={
                    isBusy ||
                    (quiz.roundStep === 'pick' && !quiz.selectedChoice)
                  }
                  onClick={() => quiz.primaryAction()}
                >
                  {primaryLabel}
                </Button>
              </div>
            </Card>
          </div>
        )}

      {quiz.phase === 'done' && quiz.finalPercent !== null && quiz.levelLabel && (
        <div className="space-y-6">
          <Card className="p-8 border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50/60">
            <p className="text-sm uppercase tracking-wide text-blue-900/80">
              Bilan du quiz
            </p>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {frenchLevel(quiz.levelLabel)}
                </p>
                <p className="text-sm text-gray-600">
                  Selon votre score final sur l’ensemble du test.
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Pourcentage de réussite</p>
                <p className="text-4xl font-bold text-blue-800">
                  {quiz.finalPercent}%
                </p>
              </div>
            </div>
            <p className="mt-6 text-sm text-gray-700 leading-relaxed">
              Seuils : moins de 40 % → Débutant · entre 40 % et 70 % →
              Intermédiaire · au-dessus de 70 % → Avancé.
            </p>
          </Card>

          {quiz.aiExplanation && (
            <Card className="p-6">
              <p className="text-sm font-semibold text-gray-900 mb-2">
                Dernier feedback IA
              </p>
              <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                {quiz.aiExplanation}
              </p>
            </Card>
          )}

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => quiz.resetQuiz()}>
              Recommencer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
