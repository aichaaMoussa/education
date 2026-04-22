'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import type {
  GeneratedQuestionPayload,
  QuizDifficulty,
} from '@/lib/types/gemini-quiz';

/** Ordre croissant de difficulté pour l’adaptation dynamique. */
const ORDER: QuizDifficulty[] = ['beginner', 'intermediate', 'advanced'];

export function adjustDifficulty(
  current: QuizDifficulty,
  correct: boolean
): QuizDifficulty {
  const i = ORDER.indexOf(current);
  if (correct) return ORDER[Math.min(i + 1, ORDER.length - 1)];
  return ORDER[Math.max(i - 1, 0)];
}

/**
 * Règles demandées :
 * &lt; 40 % → Beginner · 40–70 % → Intermediate · &gt; 70 % → Advanced
 */
export function evaluateLevelLabel(
  percent: number
): 'Beginner' | 'Intermediate' | 'Advanced' {
  if (percent < 40) return 'Beginner';
  if (percent <= 70) return 'Intermediate';
  return 'Advanced';
}

export function frenchLevel(
  label: 'Beginner' | 'Intermediate' | 'Advanced'
): string {
  switch (label) {
    case 'Beginner':
      return 'Débutant';
    case 'Intermediate':
      return 'Intermédiaire';
    default:
      return 'Avancé';
  }
}

export const DEFAULT_TOTAL_QUESTIONS = 10;

export type GeminiQuizPhase =
  | 'idle'
  | 'loadingQuestion'
  | 'playing'
  | 'loadingFeedback'
  | 'done';

/** `pick` = choix en cours · `feedback` = réponse validée, explication affichée. */
export type RoundStep = 'pick' | 'feedback';

export type UseGeminiQuizReturn = {
  phase: GeminiQuizPhase;
  roundStep: RoundStep;
  topic: string;
  setTopic: (t: string) => void;
  /** Niveau de la question affichée (adaptatif). */
  currentLevel: QuizDifficulty;
  questionIndex: number;
  totalQuestions: number;
  current: GeneratedQuestionPayload | null;
  selectedChoice: string | null;
  setSelectedChoice: (c: string | null) => void;
  score: number;
  /** Nombre de réponses déjà soumises (pour le détail du score temps réel). */
  answeredCount: number;
  runningPercent: number;
  finalPercent: number | null;
  levelLabel: 'Beginner' | 'Intermediate' | 'Advanced' | null;
  aiExplanation: string | null;
  lastAnswerCorrect: boolean | null;
  fallbackNotice: string | null;
  error: string | null;
  startQuiz: () => Promise<void>;
  /** Valide la réponse (pick) ou passe à la question suivante (feedback). */
  primaryAction: () => Promise<void>;
  resetQuiz: () => void;
};

function sameAnswer(a: string, b: string): boolean {
  return a.trim() === b.trim();
}

export function useGeminiQuiz(
  opts?: { totalQuestions?: number }
): UseGeminiQuizReturn {
  const totalQuestions = opts?.totalQuestions ?? DEFAULT_TOTAL_QUESTIONS;

  const [phase, setPhase] = useState<GeminiQuizPhase>('idle');
  const [roundStep, setRoundStep] = useState<RoundStep>('pick');
  const [topic, setTopic] = useState('javascript');
  const [currentLevel, setCurrentLevel] = useState<QuizDifficulty>('beginner');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [current, setCurrent] = useState<GeneratedQuestionPayload | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [finalPercent, setFinalPercent] = useState<number | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(
    null
  );
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** Difficulté cible pour la prochaine question (après adaptation). */
  const [nextRoundLevel, setNextRoundLevel] =
    useState<QuizDifficulty>('beginner');

  /** Identifiant stable pour un quiz : diversifie les prompts Gemini entre les questions. */
  const sessionSeedRef = useRef<string>('');

  const runningPercent = useMemo(() => {
    if (answeredCount === 0) return 0;
    return Math.round((score / answeredCount) * 100);
  }, [score, answeredCount]);

  const levelLabel = useMemo(() => {
    if (finalPercent === null) return null;
    return evaluateLevelLabel(finalPercent);
  }, [finalPercent]);

  const fetchQuestion = useCallback(
    async (level: QuizDifficulty, indexForApi: number) => {
      setPhase('loadingQuestion');
      setError(null);
      setFallbackNotice(null);
      setAiExplanation(null);
      setLastAnswerCorrect(null);
      setRoundStep('pick');

      if (!sessionSeedRef.current) {
        sessionSeedRef.current =
          typeof globalThis.crypto !== 'undefined' &&
          typeof globalThis.crypto.randomUUID === 'function'
            ? globalThis.crypto.randomUUID()
            : `quiz-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      }

      const res = await fetch('/api/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level,
          topic,
          questionIndex: indexForApi,
          totalQuestions,
          sessionSeed: sessionSeedRef.current,
        }),
      });

      const json = (await res.json().catch(() => ({}))) as Record<
        string,
        unknown
      >;

      if (!res.ok) {
        const msg =
          typeof json.error === 'string'
            ? json.error
            : 'Impossible de générer la question.';
        throw new Error(msg);
      }

      if (json.ok !== true || !json.data || typeof json.data !== 'object') {
        throw new Error('Réponse API inattendue pour generate-question.');
      }

      const meta = json.meta as { usedFallback?: boolean } | undefined;
      if (meta?.usedFallback) {
        setFallbackNotice(
          'Question de secours : la réponse du modèle n’a pas pu être validée automatiquement.'
        );
      }

      setCurrentLevel(level);
      setCurrent(json.data as GeneratedQuestionPayload);
      setPhase('playing');
    },
    [topic, totalQuestions]
  );

  const startQuiz = useCallback(async () => {
    setScore(0);
    setAnsweredCount(0);
    setQuestionIndex(0);
    setSelectedChoice(null);
    setFinalPercent(null);
    setNextRoundLevel('beginner');
    sessionSeedRef.current =
      typeof globalThis.crypto !== 'undefined' &&
      typeof globalThis.crypto.randomUUID === 'function'
        ? globalThis.crypto.randomUUID()
        : `quiz-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    try {
      await fetchQuestion('beginner', 0);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur réseau.';
      setError(msg);
      setPhase('idle');
    }
  }, [fetchQuestion]);

  /** Étape 1 : verrouille la réponse et récupère le feedback IA. */
  const submitAnswerForFeedback = useCallback(async () => {
    if (!current || selectedChoice == null) return;

    const correct = sameAnswer(selectedChoice, current.answer);
    setLastAnswerCorrect(correct);

    setScore((prev) => prev + (correct ? 1 : 0));
    setAnsweredCount((prev) => prev + 1);

    const adapted = adjustDifficulty(currentLevel, correct);
    setNextRoundLevel(adapted);

    setPhase('loadingFeedback');

    try {
      const exRes = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: current.question,
          correctAnswer: current.answer,
          selectedAnswer: selectedChoice,
          topic,
        }),
      });
      const exJson = (await exRes.json().catch(() => ({}))) as Record<
        string,
        unknown
      >;
      if (exRes.ok && typeof exJson.explanation === 'string') {
        setAiExplanation(exJson.explanation);
      } else {
        setAiExplanation(
          current.explanation ||
            'Explication indisponible pour le moment.'
        );
      }
    } catch {
      setAiExplanation(
        current.explanation || 'Explication indisponible (erreur réseau).'
      );
    }

    setRoundStep('feedback');
    setPhase('playing');
  }, [current, selectedChoice, currentLevel, topic]);

  /** Étape 2 : termine le quiz ou charge la question suivante. */
  const advanceToNextQuestion = useCallback(async () => {
    if (!current) return;

    const isLast = questionIndex >= totalQuestions - 1;
    const pct = Math.round((score / totalQuestions) * 100);

    if (isLast) {
      setFinalPercent(pct);
      setPhase('done');
      return;
    }

    const nextIdx = questionIndex + 1;
    setQuestionIndex(nextIdx);
    setSelectedChoice(null);

    try {
      await fetchQuestion(nextRoundLevel, nextIdx);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur réseau.';
      setError(msg);
      setPhase('idle');
    }
  }, [
    current,
    questionIndex,
    totalQuestions,
    score,
    nextRoundLevel,
    fetchQuestion,
  ]);

  const primaryAction = useCallback(async () => {
    if (phase !== 'playing') return;
    if (roundStep === 'pick') {
      await submitAnswerForFeedback();
      return;
    }
    await advanceToNextQuestion();
  }, [phase, roundStep, submitAnswerForFeedback, advanceToNextQuestion]);

  const resetQuiz = useCallback(() => {
    setPhase('idle');
    setRoundStep('pick');
    setCurrent(null);
    setSelectedChoice(null);
    setScore(0);
    setAnsweredCount(0);
    setQuestionIndex(0);
    setCurrentLevel('beginner');
    setNextRoundLevel('beginner');
    setFinalPercent(null);
    setAiExplanation(null);
    setLastAnswerCorrect(null);
    setFallbackNotice(null);
    setError(null);
  }, []);

  return {
    phase,
    roundStep,
    topic,
    setTopic,
    currentLevel,
    questionIndex,
    totalQuestions,
    current,
    selectedChoice,
    setSelectedChoice,
    score,
    answeredCount,
    runningPercent,
    finalPercent,
    levelLabel,
    aiExplanation,
    lastAnswerCorrect,
    fallbackNotice,
    error,
    startQuiz,
    primaryAction,
    resetQuiz,
  };
}
