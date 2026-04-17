/** Indique si l’erreur OpenAI permet de basculer sur le questionnaire / analyse hors API. */
export function isOpenAiUnavailableError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  if (!msg.startsWith('OPENAI_')) return false;
  if (msg === 'OPENAI_API_KEY_MANQUANTE') return true;
  // Quota / facturation / surcharge
  if (/OPENAI_HTTP_429/.test(msg)) return true;
  if (/OPENAI_HTTP_(402|401|403|408|429|500|503)/.test(msg)) return true;
  if (/OPENAI_HTTP_/.test(msg)) return true;
  if (/OPENAI_(REPONSE_VIDE|JSON_INVALIDE)/.test(msg)) return true;
  return false;
}
