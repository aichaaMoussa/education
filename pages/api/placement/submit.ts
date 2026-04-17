import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { interpretPlacementResult } from '@/lib/placement/ai';
import { isOpenAiUnavailableError } from '@/lib/placement/errors';
import { getLocalPlacementInterpretation } from '@/lib/placement/localFeedback';
import { consumeAndScore } from '@/lib/placement/sessionStore';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    const sessionId =
      typeof req.body?.sessionId === 'string' ? req.body.sessionId : '';
    const responses = req.body?.responses;

    if (
      !sessionId ||
      !Array.isArray(responses) ||
      responses.some((r: unknown) => typeof r !== 'number')
    ) {
      return res.status(400).json({
        message: 'sessionId et tableau responses (indices 0–3) requis.',
      });
    }

    const scored = consumeAndScore(sessionId, responses as number[]);
    if (!scored) {
      return res.status(400).json({
        message:
          'Session expirée ou réponses invalides. Relancez un nouveau test.',
      });
    }

    const domain =
      typeof req.body?.domain === 'string' ? req.body.domain : undefined;

    try {
      const interpretation = await interpretPlacementResult({
        scorePercent: scored.percent,
        domain,
      });
      return res.status(200).json({
        scorePercent: scored.percent,
        ...interpretation,
        aiDisabled: false,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erreur';
      const useLocal =
        msg === 'OPENAI_API_KEY_MANQUANTE' || isOpenAiUnavailableError(e);

      if (useLocal) {
        const local = getLocalPlacementInterpretation({
          scorePercent: scored.percent,
          domain,
        });
        const reasonShort =
          msg === 'OPENAI_API_KEY_MANQUANTE'
            ? 'Analyse IA désactivée (clé OpenAI absente).'
            : /OPENAI_HTTP_429/.test(msg)
              ? 'Quota ou limite OpenAI atteinte — analyse hors ligne.'
              : 'Service OpenAI indisponible — analyse hors ligne.';

        return res.status(200).json({
          scorePercent: scored.percent,
          ...local,
          aiDisabled: true,
          notice: `${reasonShort} Consultez la facturation sur platform.openai.com si vous utilisez une clé API.`,
        });
      }

      throw e;
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erreur';
    console.error('POST /api/placement/submit:', e);
    return res.status(500).json({
      message: 'Erreur lors de l’analyse des résultats.',
      error: msg,
    });
  }
}
