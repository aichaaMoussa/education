# 🚀 Commandes de Déploiement VPS

## ⚠️ Important: Localisation du Projet

Le projet doit être dans un répertoire accessible (ex: `/srv` ou `~/itekane`).

```bash
# Trouver où se trouve docker-compose.yml
find / -name "docker-compose.yml" -type f 2>/dev/null | head -5

# Aller dans le répertoire du projet
cd /srv  # ou le répertoire trouvé ci-dessus
# OU
cd ~/itekane/my-app  # si vous l'avez dans votre home

# Vérifier que vous êtes au bon endroit
ls -la docker-compose.yml
```

## Déploiement Rapide

```bash
# 0. S'assurer d'être dans le bon répertoire
cd /srv  # ou le répertoire du projet
pwd  # Vérifier le répertoire actuel

# 1. Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo usermod -aG docker $USER

# 2. Préparer le serveur
sudo mkdir -p /srv/itekane-storage/{images,videos,documents,default}
sudo chown -R $USER:$USER /srv/itekane-storage
chmod -R 755 /srv/itekane-storage

# 3. Configurer .env.local
nano .env.local  # Copier le contenu de .env.example et modifier

# 4. Générer les secrets
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)"
echo "STORAGE_SECRET=$(openssl rand -base64 32)"

# 5. SSL (Let's Encrypt)
# IMPORTANT: Si vous obtenez une erreur 500, utilisez Option B (DNS Challenge)

# Option A: HTTP Challenge (si DNS pointe correctement vers ce serveur)
sudo apt install certbot -y

# Arrêter tous les services qui utilisent le port 80
sudo systemctl stop nginx 2>/dev/null || true
sudo systemctl stop apache2 2>/dev/null || true
docker-compose down 2>/dev/null || true

# Vérifier DNS (les IP doivent correspondre)
echo "=== Vérification IP/DNS ==="
echo "IP IPv4: $(curl -4 -s ifconfig.me)"
echo "IP IPv6: $(curl -6 -s ifconfig.me)"
echo "DNS itkane.net (A): $(dig +short itkane.net A 2>/dev/null || echo 'Non configuré')"
echo ""
echo "⚠️ Si IPv4 et DNS ne correspondent pas, utilisez Option B (DNS Challenge)"

# Vérifier que le port 80 est libre
sudo netstat -tlnp | grep :80 || echo "Port 80 est libre"

# Ouvrir les ports dans le firewall
sudo ufw allow 80/tcp 2>/dev/null || true
sudo ufw allow 443/tcp 2>/dev/null || true

# Obtenir le certificat
sudo certbot certonly --standalone -d itkane.net -d www.itkane.net

# Si erreur 500, utilisez Option B ci-dessous

# Option B: DNS Challenge (RECOMMANDÉ - Pas de problème IPv4/IPv6/DNS)
# Cette méthode ne nécessite PAS d'accès au port 80
# Idéal si IPv4/IPv6 ne correspondent pas ou erreur 500
sudo certbot certonly --manual --preferred-challenges dns \
  -d itkane.net -d www.itkane.net

# Certbot affichera des records TXT à ajouter dans votre DNS:
# _acme-challenge.itkane.net TXT "valeur-aleatoire-1"
# _acme-challenge.www.itkane.net TXT "valeur-aleatoire-2"
# 
# Étapes:
# 1. Ouvrez votre gestionnaire DNS (Hostinger, Cloudflare, etc.)
# 2. Ajoutez les records TXT affichés par Certbot
# 3. Attendez 1-2 minutes pour la propagation DNS
# 4. Retournez au terminal et appuyez sur Enter
#
# Après succès, copier les certificats:
mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/itkane.net/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/itkane.net/privkey.pem nginx/ssl/
sudo chown -R $USER:$USER nginx/ssl/
chmod 644 nginx/ssl/fullchain.pem
chmod 600 nginx/ssl/privkey.pem

# Option C: Certificats auto-signés temporaires (pour test uniquement)
# mkdir -p nginx/ssl
# openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
#   -keyout nginx/ssl/privkey.pem -out nginx/ssl/fullchain.pem \
#   -subj "/CN=itkane.net"

# OU certificats temporaires auto-signés
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/privkey.pem -out nginx/ssl/fullchain.pem \
  -subj "/CN=itkane.net"

# 6. Déployer
chmod +x deploy.sh
./deploy.sh

# OU manuellement:
docker-compose build
docker-compose up -d
sleep 30
docker-compose exec app npm run init:roles
docker-compose exec app npm run init:super-admin

# 7. Vérifier
docker-compose ps
docker-compose logs -f app
```

## Commandes Essentielles

```bash
# Voir les logs
docker-compose logs -f app

# Redémarrer
docker-compose restart

# Arrêter
docker-compose down

# Mise à jour
git pull && docker-compose build app && docker-compose up -d

# Backup MongoDB
docker-compose exec mongo mongodump --out /data/backup

# Accès shell
docker-compose exec app sh
```

