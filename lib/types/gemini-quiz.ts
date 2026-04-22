/**
 * Types partagés (client + serveur) pour le quiz IT basé sur Gemini.
 * Aucune dépendance serveur ici : importable côté navigateur.
 */

/** Niveau de difficulté demandé à l’API (adaptatif pendant le quiz). */
export type QuizDifficulty = 'beginner' | 'intermediate' | 'advanced';

/** Objet JSON strict renvoyé par Gemini pour une question QCM. */
export type GeneratedQuestionPayload = {
  question: string;
  /** Exactement 4 propositions distinctes. */
  choices: [string, string, string, string];
  /** Doit être strictement égale à l’une des entrées de `choices`. */
  answer: string;
  explanation: string;
};

export type GenerateQuestionRequestBody = {
  level: QuizDifficulty;
  /** Ex. javascript, react, networking, security */
  topic: string;
  /** 0-based — obligatoire pour diversifier les prompts entre les questions. */
  questionIndex?: number;
  totalQuestions?: number;
  /** Unique par quiz (UUID) — évite que le modèle répète la même formulation. */
  sessionSeed?: string;
};

export type ExplainRequestBody = {
  question: string;
  correctAnswer: string;
  selectedAnswer: string;
  topic: string;
};

export type ExplainResponseBody = {
  explanation: string;
};

export type GenerateQuestionResponseBody =
  | { ok: true; data: GeneratedQuestionPayload }
  | { ok: false; error: string };

export type QuizTopicOption = {
  id: string;
  label: string;
};
