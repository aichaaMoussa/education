# 🔧 Fix: Mixed Content (HTTP/HTTPS)

## Problème
Le navigateur affiche "Non sécurisé" ou "Mixed Content" car des ressources (images, vidéos) sont chargées en HTTP alors que la page est en HTTPS.

## Solution Appliquée

J'ai créé une fonction utilitaire `normalizeMediaUrl` qui force toutes les URLs à utiliser HTTPS.

### Fichiers modifiés:
- `lib/utils/url.ts` - Fonction de normalisation des URLs
- `pages/index.tsx` - Normalisation des thumbnails
- `pages/payment.tsx` - Normalisation des thumbnails

## Vérifications Supplémentaires

### 1. Vérifier les URLs dans MongoDB

Les URLs stockées en base peuvent être en HTTP. Pour les corriger:

```bash
# Accéder à MongoDB
docker-compose exec mongo mongosh education

# Corriger les URLs HTTP en HTTPS
db.courses.updateMany(
  { "thumbnail": /^http:\/\// },
  [{ $set: { "thumbnail": { $replaceOne: { input: "$thumbnail", find: "http://", replacement: "https://" } } } }]
)

# Vérifier les URLs corrigées
db.courses.find({}, { title: 1, thumbnail: 1 }).limit(5)
```

### 2. Vérifier STORAGE_PUBLIC_URL

```bash
# Vérifier que STORAGE_PUBLIC_URL est en HTTPS
grep STORAGE_PUBLIC_URL .env.local

# Doit être: STORAGE_PUBLIC_URL=https://itkane.net/media
# Si c'est http://, corriger:
sed -i 's|STORAGE_PUBLIC_URL=http://|STORAGE_PUBLIC_URL=https://|g' .env.local
docker-compose restart app
```

### 3. Vérifier NEXTAUTH_URL

```bash
# Vérifier que NEXTAUTH_URL est en HTTPS
grep NEXTAUTH_URL .env.local

# Doit être: NEXTAUTH_URL=https://itkane.net
```

## Rebuild après modifications

```bash
# Rebuild l'application avec les nouvelles fonctions
docker-compose build app
docker-compose restart app

# Vérifier les logs
docker-compose logs app | tail -20
```

## Vérification dans le navigateur

1. **Ouvrez la console développeur** (F12)
2. **Onglet "Console"** → Cherchez les erreurs "Mixed Content"
3. **Onglet "Network"** → Filtrez par "Img" → Vérifiez que toutes les images sont chargées en HTTPS
4. **Videz le cache** (Ctrl+Shift+Delete) et rechargez

## Commandes Rapides

```bash
# 1. Vérifier variables d'environnement
grep -E "NEXTAUTH_URL|STORAGE_PUBLIC_URL" .env.local

# 2. Rebuild avec les correctifs
docker-compose build app && docker-compose restart app

# 3. Vérifier les logs
docker-compose logs app | tail -20

# 4. Tester HTTPS
curl -I https://itkane.net | head -5
```

