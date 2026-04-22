import type { Metadata } from 'next';
import GeminiTestNiveauClient from '@/components/apprenant/GeminiTestNiveauClient';

export const metadata: Metadata = {
  title: 'Test de niveau — itkane',
  description:
    'Quiz IT adaptatif (Google Gemini) : JavaScript, React, réseaux, sécurité, etc.',
};

/**
 * Route App Router pour le test de niveau IA (sans conflit avec pages/).
 */
export default function TestNiveauPage() {
  return <GeminiTestNiveauClient />;
}
