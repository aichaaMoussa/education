# Guide de Déploiement - VPS Hostinger

## Prérequis
- Accès SSH au VPS
- Docker et Docker Compose installés
- Domaine pointé vers l'IP du VPS (itkane.net)

## 1. Installation de Docker et Docker Compose

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Installer Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Vérifier les installations
docker --version
docker-compose --version

# Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker $USER
# Déconnexion/reconnexion requise pour que les changements prennent effet
```

## 2. Préparation du Serveur

```bash
# Créer le répertoire du projet
mkdir -p ~/itekane
cd ~/itekane

# Cloner le projet (ou uploader via SCP/SFTP)
# Si vous utilisez git:
# git clone <your-repo-url> my-app
# cd my-app

# Créer le répertoire de stockage
sudo mkdir -p /srv/itekane-storage
sudo chown -R $USER:$USER /srv/itekane-storage
chmod -R 755 /srv/itekane-storage

# Créer les buckets par défaut
mkdir -p /srv/itekane-storage/images
mkdir -p /srv/itekane-storage/videos
mkdir -p /srv/itekane-storage/documents
mkdir -p /srv/itekane-storage/default
```

## 3. Configuration des Variables d'Environnement

```bash
# Créer le fichier .env.local
nano .env.local
```

Contenu de `.env.local`:
```env
# Database Connection
MONGODB_URI=mongodb://mongo:27017/education

# NextAuth Configuration
NEXTAUTH_URL=https://itkane.net
NEXTAUTH_SECRET=GÉNÉREZ_UN_SECRET_ALÉATOIRE_LONG_ET_SÉCURISÉ

# Super Admin Credentials
SUPER_ADMIN_EMAIL=admin@itkane.net
SUPER_ADMIN_PASSWORD=CHANGEZ_MOI
SUPER_ADMIN_FIRSTNAME=Super
SUPER_ADMIN_LASTNAME=Admin

# Storage Configuration
STORAGE_ROOT=/srv/itekane-storage
STORAGE_PUBLIC_URL=https://itkane.net/media
STORAGE_SECRET=GÉNÉREZ_UN_SECRET_ALÉATOIRE_FORT
MAX_UPLOAD_SIZE=104857600

# Bankily Payment
BANKILY_MERCHANT_USERNAME=votre-username-bankily
BANKILY_MERCHANT_PASSWORD=votre-password-bankily
```

Générer des secrets aléatoires:
```bash
# Générer NEXTAUTH_SECRET
openssl rand -base64 32

# Générer STORAGE_SECRET
openssl rand -base64 32
```

## 4. Installation de Certbot pour SSL (Let's Encrypt)

### Option A: HTTP Challenge (si port 80 accessible)

```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx -y

# IMPORTANT: Arrêter tous les services qui utilisent le port 80
# Certbot a besoin du port 80 libre pour démarrer son propre serveur temporaire
sudo systemctl stop nginx 2>/dev/null || true
sudo systemctl stop apache2 2>/dev/null || true
docker-compose down 2>/dev/null || true

# Vérifier que le port 80 est libre
sudo netstat -tlnp | grep :80
# Si rien n'apparaît, le port est libre. Si quelque chose apparaît, arrêtez-le.

# Ouvrir les ports dans le firewall
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Obtenir le certificat SSL (Certbot démarrera son propre serveur sur le port 80)
sudo certbot certonly --standalone -d itkane.net -d www.itkane.net

# Les certificats seront dans:
# /etc/letsencrypt/live/itkane.net/fullchain.pem
# /etc/letsencrypt/live/itkane.net/privkey.pem

# Après obtention du certificat, vous pouvez redémarrer vos services Docker
```

### Option B: DNS Challenge (si port 80 bloqué)

```bash
# Installer Certbot
sudo apt install certbot -y

# Utiliser DNS challenge
sudo certbot certonly --manual --preferred-challenges dns \
  -d itkane.net -d www.itkane.net

# Suivre les instructions pour ajouter les records TXT dans votre DNS
# Certbot affichera quelque chose comme:
# _acme-challenge.itkane.net. TXT "valeur-aleatoire"
# Ajoutez ce record dans votre DNS, attendez la propagation, puis appuyez sur Enter
```

### Option C: Certificats auto-signés temporaires (test uniquement)

```bash
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/privkey.pem \
  -out nginx/ssl/fullchain.pem \
  -subj "/C=MR/ST=State/L=City/O=ITekane/CN=itkane.net"
chmod 644 nginx/ssl/fullchain.pem
chmod 600 nginx/ssl/privkey.pem
```

## 5. Configuration SSL dans le Projet

```bash
# Créer le répertoire SSL
mkdir -p nginx/ssl

# Copier les certificats (si Let's Encrypt est déjà configuré)
sudo cp /etc/letsencrypt/live/itkane.net/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/itkane.net/privkey.pem nginx/ssl/

# Changer les permissions
sudo chown -R $USER:$USER nginx/ssl/
chmod 644 nginx/ssl/fullchain.pem
chmod 600 nginx/ssl/privkey.pem
```

**Note:** Pour le déploiement initial, vous pouvez utiliser des certificats auto-signés temporaires:
```bash
# Générer des certificats auto-signés temporaires (uniquement pour test)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/privkey.pem \
  -out nginx/ssl/fullchain.pem \
  -subj "/C=MR/ST=State/L=City/O=Organization/CN=itkane.net"
```

## 6. Build et Démarrage avec Docker Compose

```bash
# Depuis le répertoire du projet (~/itekane/my-app)

# Build les images
docker-compose build

# Démarrer les services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f

# Vérifier le statut des conteneurs
docker-compose ps
```

## 7. Initialisation de la Base de Données

```bash
# Attendre que MongoDB soit prêt (30 secondes environ)
sleep 30

# Initialiser les rôles
docker-compose exec app npm run init:roles

# Créer le super admin
docker-compose exec app npm run init:super-admin
```

## 8. Vérification du Déploiement

```bash
# Vérifier que les conteneurs sont en cours d'exécution
docker-compose ps

# Vérifier les logs de l'application
docker-compose logs app

# Vérifier les logs de Nginx
docker-compose logs nginx

# Tester l'URL
curl -I https://itkane.net
```

## 9. Commandes Utiles

```bash
# Arrêter les services
docker-compose down

# Redémarrer les services
docker-compose restart

# Redémarrer un service spécifique
docker-compose restart app

# Voir les logs en temps réel
docker-compose logs -f app

# Accéder au shell du conteneur app
docker-compose exec app sh

# Accéder au shell MongoDB
docker-compose exec mongo mongosh

# Backup de la base de données
docker-compose exec mongo mongodump --out /data/backup
docker cp itekane-mongo:/data/backup ./backup-$(date +%Y%m%d)

# Restore de la base de données
docker cp ./backup-20240115 itekane-mongo:/data/backup
docker-compose exec mongo mongorestore /data/backup
```

## 10. Mise à Jour de l'Application

```bash
# Se placer dans le répertoire du projet
cd ~/itekane/my-app

# Récupérer les dernières modifications (si git)
git pull origin main

# Rebuild et redémarrer
docker-compose build app
docker-compose up -d

# Vérifier les logs
docker-compose logs -f app
```

## 11. Configuration du Renouvellement SSL Automatique

```bash
# Ajouter un cron job pour renouveler les certificats
sudo crontab -e

# Ajouter cette ligne (renouvellement mensuel)
0 0 1 * * certbot renew --quiet && docker-compose restart nginx
```

## 12. Configuration du Firewall (UFW)

```bash
# Installer UFW
sudo apt install ufw -y

# Autoriser SSH
sudo ufw allow 22/tcp

# Autoriser HTTP et HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Activer le firewall
sudo ufw enable

# Vérifier le statut
sudo ufw status
```

## 13. Monitoring et Maintenance

```bash
# Vérifier l'utilisation des ressources
docker stats

# Vérifier l'espace disque
df -h

# Vérifier l'espace utilisé par les volumes Docker
docker system df

# Nettoyer les ressources inutilisées
docker system prune -a

# Backup du volume de stockage
sudo tar -czf backup-storage-$(date +%Y%m%d).tar.gz /srv/itekane-storage
```

## Dépannage

### Les conteneurs ne démarrent pas
```bash
# Vérifier les logs
docker-compose logs

# Vérifier la configuration
docker-compose config
```

### Erreur de connexion MongoDB
```bash
# Vérifier que MongoDB est démarré
docker-compose ps mongo

# Vérifier les logs MongoDB
docker-compose logs mginx
```

### Erreur de permissions sur le stockage
```bash
# Corriger les permissions
sudo chown -R $USER:$USER /srv/itekane-storage
chmod -R 755 /srv/itekane-storage
```

### Nginx ne démarre pas
```bash
# Vérifier la configuration Nginx
docker-compose exec nginx nginx -t

# Vérifier les logs
docker-compose logs nginx
```

## Accès à l'Application

- **Application:** https://itkane.net
- **Média:** https://itkane.net/media/
- **Connexion:** https://itkane.net/login

