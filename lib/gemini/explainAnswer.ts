import { GoogleGenerativeAI } from '@google/generative-ai';
import { getGeminiModelName, requireGeminiApiKey } from '@/lib/gemini/geminiClient';

/**
 * Produit une explication pédagogique (pourquoi la réponse correcte est la bonne).
 */
export async function explainCorrectAnswer(params: {
  question: string;
  correctAnswer: string;
  /** Ce que l’utilisateur a choisi (pour contextualiser si besoin). */
  userChoice?: string;
  topic: string;
}): Promise<string> {
  const apiKey = requireGeminiApiKey();
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: getGeminiModelName(),
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 1024,
    },
  });

  const prompt = [
    `Tu es un formateur IT sur le sujet : ${params.topic}.`,
    `Question : ${params.question}`,
    `Réponse correcte officielle : ${params.correctAnswer}`,
    params.userChoice
      ? `Choix de l’apprenant : ${params.userChoice}`
      : '',
    '',
    `Explique en 2 à 5 phrases en français pourquoi la réponse correcte est la bonne.`,
    `Ne donne pas d’autres questions ; reste concis et pédagogique.`,
  ]
    .filter(Boolean)
    .join('\n');

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}
