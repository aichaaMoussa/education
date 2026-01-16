# 🚀 Démarrage Rapide - Commandes Essentielles

## Navigation et Localisation

```bash
# Trouver où se trouve le projet
find / -name "docker-compose.yml" -type f 2>/dev/null | grep -v "/proc"

# Ou chercher dans les répertoires courants
ls -la /srv/
ls -la ~/itekane/
ls -la ~/

# Aller dans le répertoire du projet
cd /srv  # ou le répertoire où vous avez uploadé le projet
cd ~/itekane/my-app  # si vous l'avez dans votre home
```

## Commandes de Déploiement

```bash
# 1. Aller dans le répertoire du projet
cd /srv  # ou le répertoire où se trouve docker-compose.yml

# 2. Vérifier que vous êtes au bon endroit
ls -la docker-compose.yml
ls -la deploy.sh

# 3. Rendre les scripts exécutables
chmod +x deploy.sh
chmod +x get-ssl.sh  # si vous l'avez

# 4. Déployer
./deploy.sh
```

## Structure du Projet

Le projet doit contenir :
- `docker-compose.yml`
- `Dockerfile`
- `deploy.sh`
- `nginx/`
- `package.json`
- `.env.local`

## Si le Projet n'est Pas Encore Uploadé

```bash
# Créer le répertoire
mkdir -p /srv/itekane
cd /srv/itekane

# Uploader les fichiers via SCP depuis votre machine locale:
# scp -r my-app/* user@server:/srv/itekane/

# Ou cloner depuis Git:
# git clone <votre-repo> my-app
# cd my-app
```

