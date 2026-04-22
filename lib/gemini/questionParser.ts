import type { GeneratedQuestionPayload } from '@/lib/types/gemini-quiz';

/**
 * Retire les blocs markdown ```json ... ``` éventuellement ajoutés par le modèle.
 */
function stripCodeFences(text: string): string {
  let t = text.trim();
  const fence = /^```(?:json)?\s*\r?\n?([\s\S]*?)\r?\n?```$/im;
  const m = t.match(fence);
  if (m?.[1]) return m[1].trim();
  if (t.startsWith('```')) {
    t = t.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/,'').trim();
  }
  return t;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

/**
 * Associe la chaîne `answer` à une des propositions (tolère casse / espaces).
 */
export function resolveAnswerToChoice(
  answer: string,
  choices: string[]
): string | null {
  const a = answer.trim();
  const exact = choices.find((c) => c === a);
  if (exact) return exact;
  const ci = choices.find((c) => c.toLowerCase().trim() === a.toLowerCase());
  return ci ?? null;
}

/**
 * Valide et normalise un objet parsé depuis JSON.
 */
export function normalizeQuestionPayload(
  raw: unknown
): GeneratedQuestionPayload | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const question = o.question;
  const choicesRaw = o.choices;
  const answer = o.answer;
  const explanation = o.explanation;

  if (!isNonEmptyString(question)) return null;
  if (!isNonEmptyString(explanation)) return null;
  if (!isNonEmptyString(answer)) return null;
  if (!Array.isArray(choicesRaw) || choicesRaw.length !== 4) return null;

  const choices = choicesRaw.map((c) =>
    typeof c === 'string' ? c.trim() : ''
  );
  if (choices.some((c) => !c)) return null;

  const resolved = resolveAnswerToChoice(answer, choices);
  if (!resolved) return null;

  const tuple: [string, string, string, string] = [
    choices[0],
    choices[1],
    choices[2],
    choices[3],
  ];

  return {
    question: question.trim(),
    choices: tuple,
    answer: resolved,
    explanation: explanation.trim(),
  };
}

/**
 * Parse la réponse texte du modèle et renvoie un objet valide ou null.
 */
export function parseModelQuestionJson(text: string): GeneratedQuestionPayload | null {
  const cleaned = stripCodeFences(text);
  try {
    const parsed = JSON.parse(cleaned) as unknown;
    return normalizeQuestionPayload(parsed);
  } catch {
    return null;
  }
}

export type FallbackVariantCtx = {
  topic: string;
  level: string;
  /** Permet des secours différents à chaque appel (index question + seed). */
  variantKey: number;
};

/**
 * Question de secours si Gemini renvoie un JSON invalide — plusieurs modèles pour éviter la répétition.
 */
export function buildFallbackQuestion(ctx: FallbackVariantCtx): GeneratedQuestionPayload {
  const t = ctx.topic || 'informatique';
  const level = ctx.level;
  const v = Math.abs(ctx.variantKey) % 8;

  const templates: GeneratedQuestionPayload[] = [
    {
      question: `[Secours] Concernant ${t} (${level}), quelle pratique est généralement recommandée ?`,
      choices: [
        'Ignorer les erreurs non bloquantes en production.',
        'Journaliser uniquement les erreurs fatales.',
        `Valider les entrées utilisateur et traiter les erreurs de façon explicite.`,
        'Désactiver les contrôles de type pour plus de flexibilité.',
      ],
      answer: `Valider les entrées utilisateur et traiter les erreurs de façon explicite.`,
      explanation:
        'Valider les entrées et gérer les erreurs réduit les risques et améliore la maintenabilité.',
    },
    {
      question: `[Secours] Pour ${t} au niveau ${level}, quel énoncé est le plus plausible ?`,
      choices: [
        'Les performances ne dépendent que du langage choisi.',
        'La documentation remplace les tests automatisés.',
        `Il faut mesurer et profiler avant d’optimiser à l’aveugle.`,
        'La sécurité est uniquement un problème d’infrastructure.',
      ],
      answer: `Il faut mesurer et profiler avant d’optimiser à l’aveugle.`,
      explanation:
        'Profiler permet de cibler les vrais goulots d’étranglement au lieu de supposer.',
    },
    {
      question: `[Secours] Dans le contexte ${t} (${level}), que privilégier ?`,
      choices: [
        'Dupliquer la logique métier dans plusieurs couches.',
        `Réutiliser des modules cohérents et limiter le couplage.`,
        'Centraliser tout dans un seul fichier géant.',
        'Éviter les tests pour livrer plus vite.',
      ],
      answer: `Réutiliser des modules cohérents et limiter le couplage.`,
      explanation:
        'Modularité et faible couplage facilitent les évolutions et les tests.',
    },
    {
      question: `[Secours] À propos de ${t}, quelle affirmation est correcte (${level}) ?`,
      choices: [
        'HTTPS suffit à éliminer toutes les vulnérabilités applicatives.',
        `Il faut combiner défense en profondeur (authN/Z, validation, mises à jour).`,
        'Les secrets peuvent rester dans le dépôt si le repo est privé.',
        'La sécurité ne concerne que le backend.',
      ],
      answer: `Il faut combiner défense en profondeur (authN/Z, validation, mises à jour).`,
      explanation:
        'La sécurité couvre plusieurs couches ; HTTPS est nécessaire mais pas suffisant seul.',
    },
    {
      question: `[Secours] Question ${t} (${level}) : bonne attitude ?`,
      choices: [
        'Commit directement sur la branche principale sans revue.',
        `Utiliser des branches, revues de code et CI basique.`,
        'Ne jamais documenter pour aller plus vite.',
        'Éviter git pour simplifier.',
      ],
      answer: `Utiliser des branches, revues de code et CI basique.`,
      explanation:
        'Workflow Git et revues réduisent les régressions et améliorent la qualité.',
    },
    {
      question: `[Secours] Sur ${t}, quel point est souvent crucial (${level}) ?`,
      choices: [
        'Toujours augmenter la taille des bundles sans analyse.',
        `Comprendre le modèle d’exécution et les coûts des opérations.`,
        'Ne jamais utiliser de cache.',
        'Ignorer l’accessibilité web.',
      ],
      answer: `Comprendre le modèle d’exécution et les coûts des opérations.`,
      explanation:
        'Comprendre comment le code s’exécute aide à écrire du code efficace.',
    },
    {
      question: `[Secours] En ${t} (${level}), quelle phrase est la plus raisonnable ?`,
      choices: [
        'Les variables globales simplifient toujours l’architecture.',
        `Des interfaces claires entre composants facilitent les tests et la maintenance.`,
        'Les tests sont réservés aux grands projets uniquement.',
        'La dette technique est toujours négligeable.',
      ],
      answer: `Des interfaces claires entre composants facilitent les tests et la maintenance.`,
      explanation:
        'Des contrats clairs entre modules réduit les bugs d’intégration.',
    },
    {
      question: `[Secours] ${t} — quel principe est pertinent (${level}) ?`,
      choices: [
        'Ne jamais versionner la configuration.',
        `Isoler config et secrets (variables d’environnement, coffres).`,
        'Partager les clés API dans le code front.',
        'Désactiver les logs en production systématiquement.',
      ],
      answer: `Isoler config et secrets (variables d’environnement, coffres).`,
      explanation:
        'Séparer configuration et secrets limite les fuites et facilite les déploiements.',
    },
  ];

  return templates[v];
}
