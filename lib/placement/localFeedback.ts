export type LocalInterpretation = {
  niveau: 'Débutant' | 'Intermédiaire' | 'Avancé';
  resume: string;
  conseils: string[];
};

/**
 * Retour pédagogique sans appel IA (quota OpenAI, erreur réseau, etc.).
 */
export function getLocalPlacementInterpretation(params: {
  scorePercent: number;
  domain?: string;
}): LocalInterpretation {
  const p = params.scorePercent;
  const niveau: LocalInterpretation['niveau'] =
    p >= 71 ? 'Avancé' : p >= 45 ? 'Intermédiaire' : 'Débutant';

  const resume =
    p >= 71
      ? `Très bon résultat (${p} %) : vos connaissances en informatique évaluées sont solides. Vous pouvez viser des formations IT plus exigeantes ou une spécialisation (développement, données, réseaux, sécurité, etc.).`
      : p >= 45
        ? `Résultat satisfaisant (${p} %) : vous avez des bases correctes en informatique mais des points méritent du renforcement. Choisissez des parcours avec pratique guidée sur les notions où vous avez hésité.`
        : `Score de ${p} % : il est recommandé de consolider les fondamentaux informatiques (réseaux, bases de données, programmation, bonnes pratiques) avant des modules avancés. Commencez par des formations « débutant » ou « fondamentaux » en IT.`;

  const conseils = [
    params.domain
      ? `Pour « ${params.domain} », vérifiez les prérequis techniques sur les fiches de formation IT du catalogue itkane avant de vous inscrire.`
      : 'Parcourez le catalogue itkane en filtrant les formations informatiques et vérifiez le niveau indiqué (débutant / intermédiaire / avancé).',
    'Refaites ce test après quelques semaines de formation pour mesurer votre progression.',
    'En cas de blocage, privilégiez les cours avec forum ou accompagnement formateur.',
  ];

  return { niveau, resume, conseils };
}
