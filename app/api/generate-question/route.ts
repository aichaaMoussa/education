import { NextResponse } from 'next/server';
import type { QuizDifficulty } from '@/lib/types/gemini-quiz';
import {
  generateStructuredQuestion,
  type GenerationContext,
} from '@/lib/gemini/geminiClient';

export const runtime = 'nodejs';

function isQuizDifficulty(x: unknown): x is QuizDifficulty {
  return x === 'beginner' || x === 'intermediate' || x === 'advanced';
}

function isNonEmptyTopic(x: unknown): x is string {
  return typeof x === 'string' && x.trim().length > 0;
}

/**
 * POST /api/generate-question
 * Corps : { level, topic, questionIndex?, totalQuestions?, sessionSeed? }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { ok: false, error: 'Corps JSON invalide.' },
        { status: 400 }
      );
    }

    const record = body as Record<string, unknown>;
    const levelRaw = record.level;
    const topicRaw = record.topic;

    if (!isQuizDifficulty(levelRaw)) {
      return NextResponse.json(
        { ok: false, error: 'level doit être beginner | intermediate | advanced.' },
        { status: 400 }
      );
    }

    if (!isNonEmptyTopic(topicRaw)) {
      return NextResponse.json(
        { ok: false, error: 'topic doit être une chaîne non vide.' },
        { status: 400 }
      );
    }

    const topic = topicRaw.trim();

    const qiRaw = record.questionIndex;
    const questionIndex =
      typeof qiRaw === 'number' &&
      Number.isFinite(qiRaw) &&
      qiRaw >= 0 &&
      qiRaw === Math.floor(qiRaw)
        ? Math.floor(qiRaw)
        : 0;

    const tqRaw = record.totalQuestions;
    const totalQuestions =
      typeof tqRaw === 'number' &&
      Number.isFinite(tqRaw) &&
      tqRaw >= 1 &&
      tqRaw === Math.floor(tqRaw)
        ? Math.floor(tqRaw)
        : 10;

    const seedRaw = record.sessionSeed;
    const sessionSeed =
      typeof seedRaw === 'string' && seedRaw.trim().length > 0
        ? seedRaw.trim()
        : `srv-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const ctx: GenerationContext = {
      questionIndex,
      totalQuestions,
      sessionSeed,
    };

    const { data, usedFallback } = await generateStructuredQuestion(
      levelRaw,
      topic,
      ctx
    );

    return NextResponse.json({
      ok: true,
      data,
      meta: {
        /** Indique si la question de secours locale a été utilisée (parse/API). */
        usedFallback,
      },
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'Erreur serveur lors de la génération.';
    const status = message.includes('GEMINI_API_KEY') ? 503 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
