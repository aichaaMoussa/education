import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { generatePlacementQuestions } from '@/lib/placement/ai';
import { getFallbackPlacementQuestions } from '@/lib/placement/fallbackQuestions';
import { isOpenAiUnavailableError } from '@/lib/placement/errors';
import { savePlacementSession } from '@/lib/placement/sessionStore';

function buildResponse(
  questions: ReturnType<typeof getFallbackPlacementQuestions>,
  domain: string | undefined,
  source: 'openai' | 'embedded',
  notice?: string
) {
  const correctIndexes = questions.map((q) => q.correctIndex);
  const sessionId = savePlacementSession(correctIndexes);

  const publicQuestions = questions.map(({ correctIndex: _, ...rest }) => ({
    id: rest.id,
    question: rest.question,
    options: rest.options,
  }));

  return {
    sessionId,
    questions: publicQuestions,
    domain: domain ?? null,
    source,
    ...(notice ? { notice } : {}),
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const strictAi = process.env.PLACEMENT_STRICT_AI === 'true';

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    const domain =
      typeof req.body?.domain === 'string' ? req.body.domain : undefined;

    try {
      const { questions } = await generatePlacementQuestions(domain);
      return res
        .status(200)
        .json(buildResponse(questions, domain, 'openai'));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erreur';

      if (strictAi) {
        if (msg === 'OPENAI_API_KEY_MANQUANTE') {
          return res.status(503).json({
            message:
              'Le test IA nécessite OPENAI_API_KEY ou désactivez PLACEMENT_STRICT_AI.',
          });
        }
        if (isOpenAiUnavailableError(e)) {
          return res.status(503).json({
            message:
              'OpenAI est temporairement indisponible ou votre quota est dépassé. Vérifiez facturation et limites sur platform.openai.com, ou retirez PLACEMENT_STRICT_AI pour utiliser le questionnaire intégré.',
            code: 'OPENAI_UNAVAILABLE',
          });
        }
        console.error('POST /api/placement/start:', e);
        return res.status(500).json({
          message: 'Impossible de générer le test pour le moment.',
          error: msg,
        });
      }

      // Mode tolérant : questionnaire intégré si pas de clé / quota / erreur API
      if (
        msg === 'OPENAI_API_KEY_MANQUANTE' ||
        isOpenAiUnavailableError(e)
      ) {
        const fallback = getFallbackPlacementQuestions();
        const notice =
          msg === 'OPENAI_API_KEY_MANQUANTE'
            ? 'Clé OpenAI absente : questionnaire intégré utilisé.'
            : 'API OpenAI indisponible ou quota dépassé : questionnaire intégré utilisé. Réactivez la facturation ou augmentez le quota pour des questions générées par IA.';
        return res
          .status(200)
          .json(buildResponse(fallback, domain, 'embedded', notice));
      }

      console.error('POST /api/placement/start:', e);
      const fallback = getFallbackPlacementQuestions();
      return res.status(200).json(
        buildResponse(
          fallback,
          domain,
          'embedded',
          'Erreur lors de la génération IA : questionnaire intégré utilisé.'
        )
      );
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erreur';
    console.error('POST /api/placement/start:', e);
    return res.status(500).json({
      message: 'Impossible de générer le test pour le moment.',
      error: msg,
    });
  }
}
