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
docker-compose build app
docker-compose up -d

# 5. Vérifier que tout fonctionne
docker-compose ps
docker-compose logs -f app
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
docker-compose build app
docker-compose up -d

# 5. Vérifier que tout fonctionne
docker-compose ps
docker-compose logs -f app
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
docker-compose build app

# Redémarrer les services
echo "🚀 Redémarrage des services..."
docker-compose up -d

# Attendre que les services démarrent
sleep 10

# Vérifier le statut
echo "✅ Vérification du statut..."
docker-compose ps

echo "✅ Mise à jour terminée!"
echo "📊 Voir les logs: docker-compose logs -f app"
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
docker-compose logs -f app

# Voir le statut des conteneurs
docker-compose ps

# Vérifier les erreurs
docker-compose logs app | grep -i error

# Redémarrer seulement l'application
docker-compose restart app

# Voir l'utilisation des ressources
docker stats
```

## En cas de problème

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

## Notes importantes

1. **Sauvegarder avant de mettre à jour** :
   ```bash
   # Backup MongoDB
   docker-compose exec mongo mongodump --out /data/backup/$(date +%Y%m%d_%H%M%S)
   ```

2. **Vérifier .env.local sur le serveur** :
   Assurez-vous que les variables `SUPER_ADMIN_EMAIL` et `SUPER_ADMIN_PASSWORD` sont bien définies dans `.env.local` sur le serveur.

3. **Redémarrer après modification de .env.local** :
   Si vous modifiez `.env.local`, vous devez redémarrer :
   ```bash
   docker-compose restart app
   ```
