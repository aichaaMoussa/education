import type { PlacementQuestionGenerated } from './ai';

/**
 * QCM de secours si l’API OpenAI est indisponible (quota, 429, etc.).
 * 8 questions — uniquement informatique (réseaux, web, BD, outils, sécurité de base).
 */
export function getFallbackPlacementQuestions(): PlacementQuestionGenerated[] {
  return [
    {
      id: 'fb1',
      question:
        'Par défaut, sur quel port TCP écoute en général un serveur HTTP non chiffré ?',
      options: ['80', '443', '22', '25'],
      correctIndex: 0,
    },
    {
      id: 'fb2',
      question:
        'Lequel de ces éléments est un langage de balisage utilisé pour structurer des pages web ?',
      options: ['HTML', 'Python', 'SQL', 'Bash'],
      correctIndex: 0,
    },
    {
      id: 'fb3',
      question: 'Dans la suite de protocoles TCP/IP, que désigne principalement « IP » ?',
      options: [
        'Internet Protocol (adressage et routage des paquets)',
        'Integrated Program',
        'Input Process',
        'Internal Port',
      ],
      correctIndex: 0,
    },
    {
      id: 'fb4',
      question:
        'Dans une base de données relationnelle, à quoi sert en principe une clé primaire ?',
      options: [
        'À identifier de façon unique une ligne dans une table',
        'À chiffrer toute la base',
        'À dupliquer les lignes automatiquement',
        'À interdire toute jointure entre tables',
      ],
      correctIndex: 0,
    },
    {
      id: 'fb5',
      question:
        'Par rapport à HTTP, qu’apporte principalement HTTPS pour les communications web ?',
      options: [
        'Le chiffrement des échanges entre le client et le serveur',
        'Une vitesse de téléchargement garantie plus élevée',
        'La suppression du besoin de serveur DNS',
        'Le remplacement du protocole TCP par UDP',
      ],
      correctIndex: 0,
    },
    {
      id: 'fb6',
      question:
        'Git est principalement utilisé comme :',
      options: [
        'Un système de gestion de versions (suivi des modifications du code)',
        'Un serveur de bases de données',
        'Un pare-feu applicatif',
        'Un protocole de messagerie instantanée',
      ],
      correctIndex: 0,
    },
    {
      id: 'fb7',
      question:
        'JSON est en pratique :',
      options: [
        'Un format texte d’échange de données structurées (souvent objets / listes)',
        'Un langage compilé pour microcontrôleurs',
        'Un système de fichiers Linux',
        'Un algorithme de compression sans perte',
      ],
      correctIndex: 0,
    },
    {
      id: 'fb8',
      question:
        'Le langage SQL sert avant tout à :',
      options: [
        'Décrire des requêtes sur des données stockées de façon relationnelle',
        'Déployer des machines virtuelles sur un hyperviseur',
        'Configurer uniquement les adresses MAC des cartes réseau',
        'Créer des certificats SSL sans autorité de certification',
      ],
      correctIndex: 0,
    },
  ];
}
