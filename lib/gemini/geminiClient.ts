import { GoogleGenerativeAI } from '@google/generative-ai';
import type {
  GeneratedQuestionPayload,
  QuizDifficulty,
} from '@/lib/types/gemini-quiz';
import {
  buildFallbackQuestion,
  parseModelQuestionJson,
} from '@/lib/gemini/questionParser';

/** Modèle Gemini (surchargeable via ENV pour suivre les nouvelles versions Google). */
export function getGeminiModelName(): string {
  return process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';
}

export function requireGeminiApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key?.trim()) {
    throw new Error('GEMINI_API_KEY manquant côté serveur.');
  }
  return key.trim();
}

/** Angles imposés en rotation pour forcer la diversité sur un même sujet. */
const TOPIC_ANGLES = [
  'syntaxe et sémantique',
  'API standard / bibliothèques',
  'performance et complexité',
  'débogage et erreurs courantes',
  'sécurité et bonnes pratiques',
  'tests et qualité',
  'architecture et modularité',
  'réseau / runtime / environnement',
  'outillage (build, lint, CI)',
  'pièges et cas limites',
] as const;

function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export type GenerationContext = {
  questionIndex: number;
  totalQuestions: number;
  sessionSeed: string;
};

function buildGenerationPrompt(
  level: QuizDifficulty,
  topic: string,
  ctx: GenerationContext
): string {
  const levelHint =
    level === 'beginner'
      ? 'niveau débutant : définitions, syntaxe de base, concepts simples.'
      : level === 'intermediate'
        ? 'niveau intermédiaire : patterns courants, API, débogage, bonnes pratiques.'
        : 'niveau avancé : performances, sécurité, architecture, pièges subtils, design.';

  const angle =
    TOPIC_ANGLES[
      (ctx.questionIndex + hashSeed(ctx.sessionSeed)) % TOPIC_ANGLES.length
    ];

  return [
    `Tu es un expert en évaluation technique IT.`,
    `Sujet principal du QCM : "${topic}".`,
    levelHint,
    '',
    `CONTEXTE DU TOUR (obligatoire pour diversifier) :`,
    `- Il s'agit de la question ${ctx.questionIndex + 1} sur ${ctx.totalQuestions} dans UN MÊME quiz.`,
    `- Identifiant de session quiz (opaque, à respecter tel quel) : "${ctx.sessionSeed}".`,
    `- Angle imposé pour cette question : "${angle}". Tu dois traiter cet angle dans le cadre du sujet "${topic}".`,
    `- Tu DOIS produire une question RADICALEMENT différente des autres tours du même quiz : change le concept testé, la formulation, et la bonne réponse.`,
    `- Ne répète pas une question déjà typique des QCM génériques ; varie les situations (debug, perf, sécurité, API, etc.).`,
    '',
    `Contraintes STRICTES :`,
    `- Une seule question à choix multiples avec EXACTEMENT 4 propositions (choices), toutes distinctes.`,
    `- Une seule réponse correcte : le champ "answer" doit être IDENTIQUE (caractère pour caractère) à l'une des 4 chaînes dans choices.`,
    `- Rédige en français clair.`,
    `- Ne produis AUCUN texte hors d'un unique objet JSON.`,
    `- Le JSON doit respecter exactement :`,
    `{"question":"...","choices":["","","",""],"answer":"...","explanation":"..."}`,
    `- L'explanation résume pourquoi la bonne réponse est correcte (2-4 phrases).`,
  ].join('\n');
}

/**
 * Appelle Gemini et renvoie toujours un objet question valide (fallback interne si parse KO).
 */
export async function generateStructuredQuestion(
  level: QuizDifficulty,
  topic: string,
  ctx: GenerationContext
): Promise<{
  data: GeneratedQuestionPayload;
  usedFallback: boolean;
  rawSnippet?: string;
}> {
  const variantKey =
    hashSeed(ctx.sessionSeed) + ctx.questionIndex * 104729 + topic.length;

  const apiKey = requireGeminiApiKey();
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: getGeminiModelName(),
    generationConfig: {
      // Température plus élevée + légère topP pour limiter les questions quasi identiques.
      temperature: 0.9,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
    },
  });

  const prompt = buildGenerationPrompt(level, topic, ctx);

  let text = '';
  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    text = response.text();
  } catch (e) {
    const fb = buildFallbackQuestion({ topic, level, variantKey });
    return {
      data: fb,
      usedFallback: true,
      rawSnippet:
        e instanceof Error ? e.message : 'Erreur inconnue lors de l’appel Gemini.',
    };
  }

  const parsed = parseModelQuestionJson(text);
  if (parsed) {
    return { data: parsed, usedFallback: false };
  }

  return {
    data: buildFallbackQuestion({ topic, level, variantKey }),
    usedFallback: true,
    rawSnippet: text.slice(0, 500),
  };
}
