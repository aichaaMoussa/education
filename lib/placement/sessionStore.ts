/**
 * Session serveur courte pour le test de placement (réponses attendues non exposées au client).
 * En production multi-instance, préférer Redis.
 */

type PlacementSessionData = {
  correctIndexes: number[];
  expiresAt: number;
};

const store = new Map<string, PlacementSessionData>();

const TTL_MS = 60 * 60 * 1000;

function prune() {
  const now = Date.now();
  for (const [k, v] of store.entries()) {
    if (v.expiresAt < now) store.delete(k);
  }
}

export function savePlacementSession(correctIndexes: number[]): string {
  prune();
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  store.set(id, {
    correctIndexes,
    expiresAt: Date.now() + TTL_MS,
  });
  return id;
}

/**
 * Calcule le score % et supprime la session (usage unique).
 */
export function consumeAndScore(
  sessionId: string,
  responses: number[]
): { percent: number } | null {
  prune();
  const entry = store.get(sessionId);
  if (!entry || Date.now() > entry.expiresAt) {
    return null;
  }
  const { correctIndexes } = entry;
  store.delete(sessionId);

  if (
    !Array.isArray(responses) ||
    responses.length !== correctIndexes.length
  ) {
    return null;
  }

  let correct = 0;
  for (let i = 0; i < correctIndexes.length; i++) {
    const r = responses[i];
    if (typeof r !== 'number' || r < 0 || r > 3) {
      return null;
    }
    if (r === correctIndexes[i]) correct++;
  }

  const percent = Math.round((correct / correctIndexes.length) * 100);
  return { percent };
}
