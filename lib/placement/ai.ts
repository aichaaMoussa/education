import { z } from 'zod';

const QuestionGenerated = z.object({
  id: z.string(),
  question: z.string(),
  options: z.array(z.string()).length(4),
  correctIndex: z.number().min(0).max(3),
});

const PlacementPayload = z.object({
  questions: z.array(QuestionGenerated).min(6).max(10),
});

export type PlacementQuestionPublic = {
  id: string;
  question: string;
  options: string[];
};

export type PlacementQuestionGenerated = z.infer<typeof QuestionGenerated>;

async function chatJson<T>(
  system: string,
  user: string,
  parser: z.ZodType<T>
): Promise<T> {
  const key = process.env.OPENAI_API_KEY;
  if (!key?.trim()) {
    throw new Error('OPENAI_API_KEY_MANQUANTE');
  }

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.35,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`OPENAI_HTTP_${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) {
    throw new Error('OPENAI_REPONSE_VIDE');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('OPENAI_JSON_INVALIDE');
  }

  return parser.parse(parsed);
}

/**
 * Génère des QCM pour estimer le niveau en informatique uniquement (programmation,
 * réseaux, bases de données, OS, web, sécurité de base, outils dev).
 */
export async function generatePlacementQuestions(theme?: string): Promise<{
  questions: PlacementQuestionGenerated[];
}> {
  const themeHint =
    theme?.trim() ||
    'transversal : fondamentaux et pratiques courantes en informatique';

  const system = `Tu es un concepteur de tests de positionnement pour une plateforme e-learning francophone (itkane).
Tu réponds UNIQUEMENT par un objet JSON valide, sans markdown.
Schéma attendu:
{
  "questions": [
    {
      "id": "q1",
      "question": "intitulé clair",
      "options": ["A","B","C","D"],
      "correctIndex": 0
    }
  ]
}
Règles strictes:
- exactement 8 questions.
- TOUTES les questions doivent porter UNIQUEMENT sur l'informatique et le numérique technique : programmation (bases), algorithmique légère, réseaux, protocoles, bases de données, systèmes d'exploitation, développement web, sécurité informatique (bonnes pratiques, menaces courantes), outils (Git, IDE, lignes de commande), formats (JSON, HTML côté concept), cloud introductif, conteneurs de base, etc.
- INTERDIT : grammaire / littérature, culture générale non tech, mathématiques hors contexte informatique, logique pure sans lien IT, savoir-vivre professionnel non technique, questions de langues.
- chaque question a exactement 4 options, une seule bonne réponse (correctIndex 0 à 3).
- difficulté variée du plus facile au plus exigeant.
- pas de calculatrice complexe.
- rédige tout en français correct.`;

  const user = `Sous-thème ou angle optionnel pour varier les sujets IT (sinon ignore) : "${themeHint}".
Génère le JSON des 8 questions — exclusivement informatique.`;

  const parsed = await chatJson(system, user, PlacementPayload);
  return { questions: parsed.questions };
}

const InterpretPayload = z.object({
  niveau: z.enum(['Débutant', 'Intermédiaire', 'Avancé']),
  resume: z.string().min(20),
  conseils: z.array(z.string()).min(2).max(5),
});

export type PlacementInterpretation = z.infer<typeof InterpretPayload>;

export async function interpretPlacementResult(params: {
  scorePercent: number;
  domain?: string;
}): Promise<PlacementInterpretation> {
  const system = `Tu es un conseiller pédagogique pour itkane (plateforme de formation en ligne).
Le test évalue uniquement des compétences en informatique / technologies.
Tu réponds UNIQUEMENT par un objet JSON valide :
{
  "niveau": "Débutant" | "Intermédiaire" | "Avancé",
  "resume": "2 à 4 phrases en français",
  "conseils": ["...", "...", "..."]
}
Le niveau doit être cohérent avec le pourcentage du test (approximatif : <45% souvent Débutant, 45-70% Intermédiaire, >70% Avancé — ajuste si nécessaire selon le profil décrit).
Les conseils orientent vers des parcours ou modules IT adaptés (dev, réseau, données, cybersécurité, etc.).`;

  const user = `Un apprenant a obtenu ${params.scorePercent}% au test de positionnement en informatique${params.domain ? ` (précision : ${params.domain})` : ''}.
Propose niveau, résumé motivant et conseils concrets.`;

  return chatJson(system, user, InterpretPayload);
}
