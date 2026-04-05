# 🔄 Commandes pour Mettre à Jour le Serveur

## Méthode 1 : Avec Git (Recommandée)

### Sur votre machine locale (Windows) :

```bash
# 1. Vérifier les modifications
git status

# 2. Ajouter les fichiers modifiés
git add lib/authOptions.ts lib/auth.ts

# 3. Commiter les modifications
git commit -m "Ajout authentification Super Admin via .env.local"

# 4. Pousser vers le dépôt distant
git push origin master
# OU
git push origin main
```

### Sur le serveur (SSH) :

```bash
# 1. Se connecter au serveur
ssh user@votre-serveur.com

# 2. Aller dans le répertoire du projet
cd /srv  # ou le répertoire où se trouve votre projet
# OU
cd ~/itekane/my-app

# 3. Récupérer les dernières modifications
git pull origin master
# OU
git pull origin main

# 4. Reconstruire et redémarrer les conteneurs Docker
<<<<<<< HEAD
docker compose build app
docker compose up -d

# 5. Vérifier que tout fonctionne
docker compose ps
docker compose logs -f app
=======
docker-compose build app
docker-compose up -d

# 5. Vérifier que tout fonctionne
docker-compose ps
docker-compose logs -f app
>>>>>>> b00e06faa2b3d33ad952c46382d13a7cb7d1b6a4
```

## Méthode 2 : Sans Git (Copie manuelle)

### Sur votre machine locale (Windows PowerShell) :

```powershell
# 1. Se connecter au serveur via SCP/SFTP
# Utiliser WinSCP, FileZilla, ou la commande scp

# Avec SCP (depuis PowerShell ou Git Bash):
scp lib/authOptions.ts user@votre-serveur.com:/srv/my-app/lib/
scp lib/auth.ts user@votre-serveur.com:/srv/my-app/lib/
```

### Sur le serveur (SSH) :

```bash
# 1. Se connecter au serveur
ssh user@votre-serveur.com

# 2. Aller dans le répertoire du projet
cd /srv/my-app  # ou le répertoire de votre projet

# 3. Vérifier que les fichiers sont bien copiés
ls -la lib/authOptions.ts lib/auth.ts

# 4. Reconstruire et redémarrer les conteneurs Docker
<<<<<<< HEAD
docker compose build app
docker compose up -d

# 5. Vérifier que tout fonctionne
docker compose ps
docker compose logs -f app
=======
docker-compose build app
docker-compose up -d

# 5. Vérifier que tout fonctionne
docker-compose ps
docker-compose logs -f app
>>>>>>> b00e06faa2b3d33ad952c46382d13a7cb7d1b6a4
```

## Méthode 3 : Script de mise à jour rapide

### Créer un script sur le serveur :

```bash
# Sur le serveur, créer le fichier update.sh
nano update.sh
```

Ajouter ce contenu :

```bash
#!/bin/bash
set -e

echo "🔄 Mise à jour de l'application..."

# Aller dans le répertoire du projet
cd /srv/my-app  # Ajustez selon votre configuration

# Si vous utilisez Git
if [ -d .git ]; then
    echo "📥 Récupération des modifications depuis Git..."
    git pull origin master || git pull origin main
fi

# Reconstruire l'image Docker
echo "🔨 Reconstruction de l'image..."
<<<<<<< HEAD
docker compose build app

# Redémarrer les services
echo "🚀 Redémarrage des services..."
docker compose up -d
=======
docker-compose build app

# Redémarrer les services
echo "🚀 Redémarrage des services..."
docker-compose up -d
>>>>>>> b00e06faa2b3d33ad952c46382d13a7cb7d1b6a4

# Attendre que les services démarrent
sleep 10

# Vérifier le statut
echo "✅ Vérification du statut..."
<<<<<<< HEAD
docker compose ps

echo "✅ Mise à jour terminée!"
echo "📊 Voir les logs: docker compose logs -f app"
=======
docker-compose ps

echo "✅ Mise à jour terminée!"
echo "📊 Voir les logs: docker-compose logs -f app"
>>>>>>> b00e06faa2b3d33ad952c46382d13a7cb7d1b6a4
```

Rendre le script exécutable :

```bash
chmod +x update.sh
```

Utiliser le script :

```bash
./update.sh
```

## Commandes de vérification

```bash
# Voir les logs en temps réel
<<<<<<< HEAD
docker compose logs -f app

# Voir le statut des conteneurs
docker compose ps

# Vérifier les erreurs
docker compose logs app | grep -i error

# Redémarrer seulement l'application
docker compose restart app
=======
docker-compose logs -f app

# Voir le statut des conteneurs
docker-compose ps

# Vérifier les erreurs
docker-compose logs app | grep -i error

# Redémarrer seulement l'application
docker-compose restart app
>>>>>>> b00e06faa2b3d33ad952c46382d13a7cb7d1b6a4

# Voir l'utilisation des ressources
docker stats
```

## En cas de problème

<<<<<<< HEAD
**Préférez Docker Compose V2** (`docker compose` avec un espace) plutôt que l’ancien binaire Python `docker-compose` : sur Docker Engine récent, l’ancien `docker-compose up` peut planter avec `KeyError: 'ContainerConfig'`.

```bash
# Arrêter tous les services (V2)
docker compose down

# Voir les logs détaillés
docker compose logs app

# Reconstruire depuis zéro (sans cache)
docker compose build --no-cache app
docker compose up -d

# Accéder au shell du conteneur
docker compose exec app sh

# Vérifier les variables d'environnement
docker compose exec app env | grep SUPER_ADMIN
```

### Erreur `KeyError: 'ContainerConfig'` (recreate / `docker compose up -d`)

Cause : **docker-compose 1.29.x** (Python) est incompatible avec les métadonnées d’images des Docker Engine récents.

Sur le serveur (Debian/Ubuntu) :

```bash
sudo apt-get update
sudo apt-get install -y docker-compose-plugin
docker compose version
```

Ensuite, dans le répertoire du projet (ex. `/srv/itekane/education`) :

```bash
docker compose down
docker rm -f itekane-app 2>/dev/null || true
docker compose build --no-cache app
docker compose up -d
```

Vous pouvez retirer l’ancien paquet pour éviter la confusion : `sudo apt remove docker-compose` (le binaire Python `/usr/bin/docker-compose`).

### Avertissement `Python-dotenv could not parse statement starting at line 2`

Cause : **syntaxe invalide dans `.env.local`** (fichier référencé par `env_file` dans `docker-compose.yml`). Chaque ligne doit être `NOM=valeur` avec un **signe égal**, sans espace autour du `=`.

À éviter : `CLE-valeur`, espaces dans l’URL (`http://localhost: 3000`), guillemets mal fermés, ou fichier en UTF-8 avec BOM.

Vérifiez les 3–5 premières lignes :

```bash
sed -n '1,8p' .env.local
```

Exemple valide :

```env
MONGODB_URI=mongodb://mongo:27017/education
NEXTAUTH_URL=https://itkane.net
NEXTAUTH_SECRET=votre_secret
SUPER_ADMIN_EMAIL=admin@itkane.net
SUPER_ADMIN_PASSWORD=VotreMotDePasse
```

Puis redémarrez : `docker compose up -d` (ou `docker compose restart app`).

=======
```bash
# Arrêter tous les services
docker-compose down

# Voir les logs détaillés
docker-compose logs app

# Reconstruire depuis zéro (sans cache)
docker-compose build --no-cache app
docker-compose up -d

# Accéder au shell du conteneur
docker-compose exec app sh

# Vérifier les variables d'environnement
docker-compose exec app env | grep SUPER_ADMIN
```

>>>>>>> b00e06faa2b3d33ad952c46382d13a7cb7d1b6a4
## Notes importantes

1. **Sauvegarder avant de mettre à jour** :
   ```bash
   # Backup MongoDB
<<<<<<< HEAD
   docker compose exec mongo mongodump --out /data/backup/$(date +%Y%m%d_%H%M%S)
=======
   docker-compose exec mongo mongodump --out /data/backup/$(date +%Y%m%d_%H%M%S)
>>>>>>> b00e06faa2b3d33ad952c46382d13a7cb7d1b6a4
   ```

2. **Vérifier .env.local sur le serveur** :
   Assurez-vous que les variables `SUPER_ADMIN_EMAIL` et `SUPER_ADMIN_PASSWORD` sont bien définies dans `.env.local` sur le serveur.

<<<<<<< HEAD
3. **Upload de cours / fichiers (`POST /api/upload`)** :
   Le code exige qu’au moins **`STORAGE_SECRET`** ou **`NEXTAUTH_SECRET`** soit défini (sinon erreur 500). Si vous avez déjà `NEXTAUTH_SECRET` dans `.env.local`, l’upload fonctionne sans `STORAGE_SECRET` après déploiement du correctif. Pour un secret dédié au stockage, ajoutez dans **`.env.local` sur le serveur** (format `CLE=valeur`) :

   ```env
   STORAGE_SECRET=une_chaine_longue_aleatoire
   STORAGE_ROOT=/srv/itekane-storage
   STORAGE_PUBLIC_URL=https://itkane.net/media
   MAX_UPLOAD_SIZE=104857600
   ```

   - `STORAGE_SECRET` : optionnel si `NEXTAUTH_SECRET` est déjà défini ; sinon obligatoire. Générer par exemple : `openssl rand -base64 32`
   - `STORAGE_ROOT` : doit correspondre au volume Docker (déjà `/srv/itekane-storage` dans `docker-compose.yml`)
   - `STORAGE_PUBLIC_URL` : URL publique servie par Nginx (`location /media/` → même chemin que dans `nginx/conf.d/itekane.conf`)

   Puis : `docker compose restart app`

4. **Redémarrer après modification de .env.local** :
   Si vous modifiez `.env.local`, vous devez redémarrer :
   ```bash
   docker compose restart app
=======
3. **Redémarrer après modification de .env.local** :
   Si vous modifiez `.env.local`, vous devez redémarrer :
   ```bash
   docker-compose restart app
>>>>>>> b00e06faa2b3d33ad952c46382d13a7cb7d1b6a4
   ```
