# Guide de création d'un compte Admin

## Méthode 1 : Script automatique (Recommandé)

### Créer un admin avec les valeurs par défaut

```bash
npm run create:admin
```

Cela créera un utilisateur admin avec :
- **Email** : `admin@education.com`
- **Mot de passe** : `admin123`
- **Prénom** : `Admin`
- **Nom** : `User`

### Personnaliser les informations de l'admin

Vous pouvez définir des variables d'environnement dans `.env.local` :

```env
ADMIN_EMAIL=votre@email.com
ADMIN_PASSWORD=votre_mot_de_passe_securise
ADMIN_FIRSTNAME=Votre
ADMIN_LASTNAME=Nom
```

Puis exécutez :
```bash
npm run create:admin
```

## Méthode 2 : Via l'interface d'inscription puis modification

1. **Créer un compte normal** :
   - Allez sur `/register`
   - Créez un compte avec votre email

2. **Modifier le rôle via MongoDB** :
   - Connectez-vous à MongoDB
   - Trouvez votre utilisateur dans la collection `users`
   - Trouvez l'ID du rôle `admin` dans la collection `roles`
   - Mettez à jour le champ `role` de votre utilisateur avec l'ID du rôle admin

## Méthode 3 : Via l'API (si vous avez déjà un admin)

Si vous avez déjà un compte admin, vous pouvez créer d'autres admins via l'interface `/admin/users`.

## Méthode 4 : Via MongoDB directement

1. **Connectez-vous à MongoDB** :
```bash
mongosh
use education
```

2. **Trouvez l'ID du rôle admin** :
```javascript
db.roles.findOne({ name: "admin" })
```

3. **Créez ou modifiez un utilisateur** :
```javascript
// Pour créer un nouvel admin
db.users.insertOne({
  email: "admin@education.com",
  password: "$2a$10$...", // Hash bcrypt du mot de passe
  firstName: "Admin",
  lastName: "User",
  role: ObjectId("..."), // ID du rôle admin
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})

// Pour modifier un utilisateur existant
db.users.updateOne(
  { email: "votre@email.com" },
  { $set: { role: ObjectId("...") } } // ID du rôle admin
)
```

## Vérification

Après avoir créé l'admin, connectez-vous avec :
- Email : `admin@education.com` (ou celui que vous avez défini)
- Mot de passe : `admin123` (ou celui que vous avez défini)

Vous devriez avoir accès à :
- `/admin/roles` - Gestion des rôles
- `/admin/users` - Gestion des utilisateurs
- `/dashboard` - Dashboard avec toutes les options

## Sécurité

⚠️ **Important** : Changez le mot de passe par défaut après la première connexion !

1. Connectez-vous en tant qu'admin
2. Allez sur `/admin/users`
3. Modifiez votre compte et changez le mot de passe

