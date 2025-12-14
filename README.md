# Easy Tech - Plateforme de Gestion de Formations en Ligne

Une plateforme moderne de gestion de formations en ligne similaire à Udemy et Coursera, construite avec Next.js, MongoDB, et un système de gestion de rôles dynamique avec une interface utilisateur moderne.

## 🚀 Fonctionnalités Principales

### Pour les Administrateurs
- ✅ **Gestion des Formateurs** : Créer, modifier, supprimer et activer/désactiver les formateurs
- ✅ **Gestion des Apprenants** : Gérer tous les apprenants de la plateforme
- ✅ **Validation des Formations** : Approuver ou rejeter les formations soumises par les formateurs
- ✅ **Statistiques Complètes** : Vue d'ensemble avec statistiques détaillées
- ✅ **Gestion des Rôles** : Créer et gérer les rôles avec permissions dynamiques
- ✅ **Contrôle Total** : Accès complet à toutes les fonctionnalités de la plateforme

### Pour les Formateurs
- ✅ **Créer des Formations** : Mettre en ligne des formations avec PDF, vidéos et quiz
- ✅ **Gérer leurs Cours** : Modifier, publier et suivre leurs formations
- ✅ **Espace Personnel** : Dashboard dédié pour gérer leurs contenus

### Pour les Apprenants
- ✅ **Parcourir les Formations** : Découvrir et acheter des formations
- ✅ **Suivre la Progression** : Suivre leur avancement dans les formations achetées
- ✅ **Accès au Contenu** : Accéder aux PDF, vidéos et quiz des formations achetées

## 🎨 Interface Utilisateur

- ✅ **Design Moderne** : Interface élégante avec Tailwind CSS
- ✅ **React Icons** : Icônes professionnelles dans toute l'application
- ✅ **Toast Notifications** : Notifications élégantes avec react-hot-toast
- ✅ **Responsive** : Design adaptatif pour tous les appareils
- ✅ **Animations** : Transitions fluides et animations subtiles

## 📋 Prérequis

- Node.js 18.x ou supérieur
- MongoDB installé et en cours d'exécution (localhost:27017)
- Yarn ou npm

## 🛠️ Installation

1. **Installer les dépendances** :
```bash
yarn install
# ou
npm install
```

2. **Configurer les variables d'environnement** :
Créez un fichier `.env.local` à la racine du projet (vous pouvez copier `.env.example`) :
```env
# Database Connection
MONGODB_URI=mongodb://localhost:27017/education

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-in-production-make-it-long-and-random

# Super Admin Credentials
SUPER_ADMIN_EMAIL=admin@education.com
SUPER_ADMIN_PASSWORD=admin123
SUPER_ADMIN_FIRSTNAME=Super
SUPER_ADMIN_LASTNAME=Admin

# Firebase Configuration (pour le stockage des fichiers)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

**Note pour Firebase** : 
- Créez un projet Firebase sur [Firebase Console](https://console.firebase.google.com/)
- Activez Firebase Storage
- Configurez les règles de sécurité pour permettre l'upload aux utilisateurs authentifiés
- Copiez les valeurs de configuration dans votre `.env.local`

3. **Initialiser les rôles** :
```bash
npm run init:roles
```

4. **Créer le super admin** :
```bash
npm run init:super-admin
```

Le super admin sera créé automatiquement avec les credentials définis dans le fichier `.env.local`.

5. **Lancer le serveur de développement** :
```bash
yarn dev
# ou
npm run dev
```

6. **Ouvrir le navigateur** :
Accédez à [http://localhost:3000](http://localhost:3000)

## 🔐 Rôles et Permissions

### Rôles disponibles :

1. **Admin** : Accès complet à toutes les fonctionnalités
   - Gérer formateurs et apprenants
   - Valider les formations
   - Voir les statistiques
   - Gérer les rôles et permissions

2. **Formateur** : Peut créer et gérer des formations
   - Créer des formations (PDF, vidéos, quiz)
   - Publier des formations
   - Gérer leurs cours

3. **Apprenant** : Peut suivre des formations
   - Acheter des formations
   - Suivre la progression
   - Accéder au contenu

### Permissions disponibles :

- `course:create`, `course:read`, `course:update`, `course:delete`, `course:publish`
- `lesson:create`, `lesson:read`, `lesson:update`, `lesson:delete`
- `user:create`, `user:read`, `user:update`, `user:delete`
- `role:create`, `role:read`, `role:update`, `role:delete`
- `dashboard:view`, `dashboard:admin`
- `enrollment:create`, `enrollment:read`, `enrollment:delete`

## 📁 Structure du Projet

```
my-app/
├── components/          # Composants réutilisables
│   ├── ui/             # Composants UI (Button, Input, Card, Toast, etc.)
│   ├── layout/         # Composants de layout (Header, Sidebar)
│   └── protected/      # Composants de protection
├── lib/                # Utilitaires et helpers
│   ├── mongodb.ts      # Connexion MongoDB
│   ├── auth.ts         # Fonctions d'authentification
│   ├── middleware.ts   # Middleware de sécurité backend
│   ├── permissions.ts  # Système de permissions
│   └── toast.ts        # Helper pour les notifications
├── models/             # Modèles Mongoose
│   ├── User.ts         # Utilisateurs (formateurs/apprenants)
│   ├── Role.ts         # Rôles avec permissions
│   ├── Course.ts       # Formations
│   ├── Lesson.ts       # Leçons
│   ├── Quiz.ts         # Quiz
│   └── Enrollment.ts   # Inscriptions
├── pages/              # Pages Next.js
│   ├── api/            # Routes API
│   │   ├── auth/       # Authentification
│   │   └── admin/      # Routes admin (formateurs, apprenants, statistiques, etc.)
│   ├── admin/          # Pages d'administration
│   │   ├── formateurs.tsx
│   │   ├── apprenants.tsx
│   │   ├── courses/approve.tsx
│   │   ├── statistics.tsx
│   │   └── roles.tsx
│   ├── login.tsx
│   ├── register.tsx
│   └── dashboard.tsx
└── scripts/            # Scripts utilitaires
```

## 🎯 Pages Principales

### Pages Publiques
- `/` - Page d'accueil
- `/login` - Connexion
- `/register` - Inscription (Apprenant ou Formateur)

### Pages Admin
- `/admin/formateurs` - Gestion des formateurs
- `/admin/apprenants` - Gestion des apprenants
- `/admin/courses/approve` - Validation des formations
- `/admin/statistics` - Statistiques de la plateforme
- `/admin/roles` - Gestion des rôles et permissions

### Pages Formateur
- `/formateur/courses` - Mes formations
- `/courses/create` - Créer une formation

### Pages Apprenant
- `/apprenant/courses` - Mes formations achetées
- `/apprenant/progress` - Ma progression

## 🔧 Technologies Utilisées

- **Next.js 14** : Framework React avec Pages Router
- **TypeScript** : Typage statique
- **MongoDB + Mongoose** : Base de données
- **Tailwind CSS** : Styles modernes
- **React Icons** : Icônes professionnelles
- **React Hot Toast** : Notifications élégantes
- **JWT** : Authentification
- **bcryptjs** : Hashage des mots de passe

## 📝 Utilisation

### Créer un compte

1. Allez sur `/register`
2. Remplissez le formulaire
3. Choisissez votre type de compte (Apprenant ou Formateur)

### Se connecter en tant qu'admin

1. Créez un admin avec : `npm run create:admin`
2. Connectez-vous avec :
   - Email : `admin@education.com`
   - Mot de passe : `admin123`

### Gérer les formateurs (Admin)

1. Allez sur `/admin/formateurs`
2. Cliquez sur "Ajouter un formateur"
3. Remplissez le formulaire
4. Le formateur pourra créer des formations

### Valider une formation (Admin)

1. Un formateur crée une formation
2. Allez sur `/admin/courses/approve`
3. Approuvez ou rejetez la formation

### Créer une formation (Formateur)

1. Connectez-vous en tant que formateur
2. Allez sur `/courses/create`
3. Remplissez les informations
4. Ajoutez PDF, vidéos et quiz
5. Publiez la formation (elle sera en attente d'approbation)

## 🔒 Sécurité

- ✅ **Vérification backend** : Toutes les permissions sont vérifiées côté serveur
- ✅ **Middleware de sécurité** : Protection de toutes les routes API
- ✅ **JWT Tokens** : Authentification sécurisée
- ✅ **Hashage des mots de passe** : bcrypt avec salt rounds
- ✅ **Validation des données** : Validation côté client et serveur

## 📄 Licence

Ce projet est sous licence MIT.

## 🎉 Fonctionnalités Avancées

- **Système de permissions dynamique** : Créez vos propres rôles avec des permissions personnalisées
- **Validation des formations** : Les formations doivent être approuvées par un admin avant publication
- **Suivi de progression** : Les apprenants peuvent suivre leur avancement
- **Statistiques complètes** : Vue d'ensemble pour les administrateurs
- **Interface moderne** : Design professionnel avec animations et transitions
