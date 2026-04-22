import { NextResponse } from 'next/server';
import { explainCorrectAnswer } from '@/lib/gemini/explainAnswer';

export const runtime = 'nodejs';

function isText(x: unknown): x is string {
  return typeof x === 'string' && x.trim().length > 0;
}

/**
 * POST /api/explain
 * Corps : { question, correctAnswer, selectedAnswer, topic }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Corps JSON attendu.' },
        { status: 400 }
      );
    }

    const b = body as Record<string, unknown>;

    if (!isText(b.question) || !isText(b.correctAnswer)) {
      return NextResponse.json(
        { error: 'question et correctAnswer sont requis.' },
        { status: 400 }
      );
    }

    const topic = isText(b.topic) ? b.topic.trim() : 'informatique générale';
    const selectedAnswer = isText(b.selectedAnswer) ? b.selectedAnswer.trim() : undefined;

    const explanation = await explainCorrectAnswer({
      question: b.question.trim(),
      correctAnswer: b.correctAnswer.trim(),
      userChoice: selectedAnswer,
      topic,
    });

    return NextResponse.json({ explanation });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'Impossible de générer l’explication.';
    const status = message.includes('GEMINI_API_KEY') ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
