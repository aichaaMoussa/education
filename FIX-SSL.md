# 🔧 Fix: Problème SSL Certbot

## Problèmes Courants

### Erreur 500 (Invalid response)
Si vous obtenez une erreur 500 même après avoir libéré le port 80, cela signifie généralement que :
1. **Le domaine ne pointe pas vers ce serveur** (problème DNS)
2. **Un proxy/firewall bloque l'accès** (ex: Cloudflare, firewall Hostinger)
3. **Le DNS n'est pas propagé** (attendre 24-48h)

### Erreur Timeout
Le port 80 est bloqué par un firewall.

### Solution Recommandée: DNS Challenge
Si vous obtenez des erreurs 500 répétées, utilisez le **DNS Challenge** qui ne nécessite pas d'accès au port 80.

## Solutions

### Solution 1: Libérer le port 80 et obtenir le certificat (Recommandé)

```bash
# Vérifier quel service utilise le port 80
sudo netstat -tlnp | grep :80
# ou
sudo lsof -i :80

# Arrêter tous les services qui utilisent le port 80
# Si Nginx est installé sur l'hôte:
sudo systemctl stop nginx

# Si Docker/Nginx tourne:
docker-compose down

# Ou arrêter tous les services Apache/Nginx
sudo systemctl stop apache2 2>/dev/null || true
sudo systemctl stop nginx 2>/dev/null || true

# Vérifier que le port 80 est libre
sudo netstat -tlnp | grep :80

# Ouvrir le port 80 dans le firewall si nécessaire
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Obtenir le certificat (Certbot démarrera son propre serveur sur le port 80)
sudo certbot certonly --standalone -d itkane.net -d www.itkane.net

# Après obtention du certificat, vous pouvez redémarrer vos services
# sudo systemctl start nginx
# ou
# docker-compose up -d

# Après obtention du certificat, vous pouvez fermer le port 80 si souhaité
# sudo ufw delete allow 80/tcp
```

### Solution 2: Utiliser DNS Challenge (Si port 80 bloqué)

```bash
# Méthode DNS challenge (pas besoin d'ouvrir le port 80)
sudo certbot certonly --manual --preferred-challenges dns \
  -d itkane.net -d www.itkane.net

# Certbot affichera un record TXT à ajouter à votre DNS
# Exemple:
# _acme-challenge.itkane.net. TXT "valeur-aleatoire"
# _acme-challenge.www.itkane.net. TXT "valeur-aleatoire"

# Après avoir ajouté les records TXT dans votre DNS, appuyez sur Enter

# Copier les certificats
mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/itkane.net/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/itkane.net/privkey.pem nginx/ssl/
sudo chown -R $USER:$USER nginx/ssl/
```

### Solution 3: Vérifier le Firewall Hostinger

Si vous utilisez Hostinger, vérifiez le firewall dans le panneau de contrôle :

1. Connectez-vous au panneau Hostinger
2. Allez dans **Firewall** ou **Sécurité**
3. Assurez-vous que les ports 80 et 443 sont ouverts pour votre IP

### Solution 4: Certificats auto-signés temporaires

Pour tester le déploiement avant d'obtenir Let's Encrypt :

```bash
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/privkey.pem \
  -out nginx/ssl/fullchain.pem \
  -subj "/C=MR/ST=State/L=City/O=ITekane/CN=itkane.net"

chmod 644 nginx/ssl/fullchain.pem
chmod 600 nginx/ssl/privkey.pem
```

⚠️ **Note:** Les certificats auto-signés provoqueront un avertissement dans le navigateur.

### Solution 5: Utiliser Cloudflare (Alternative)

Si vous utilisez Cloudflare comme proxy :

1. Activez le proxy Cloudflare pour votre domaine
2. Utilisez les certificats originaux de Cloudflare
3. Ou utilisez le DNS challenge avec Cloudflare

## Vérification

Après configuration SSL :

```bash
# Vérifier les certificats
ls -la nginx/ssl/

# Tester la configuration Nginx
docker-compose exec nginx nginx -t

# Redémarrer Nginx
docker-compose restart nginx

# Vérifier HTTPS
curl -I https://itkane.net
```

## Commandes rapides

```bash
# Ouvrir les ports et obtenir le certificat
sudo ufw allow 80/tcp && sudo ufw allow 443/tcp
sudo certbot certonly --standalone -d itkane.net -d www.itkane.net
mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/itkane.net/*.pem nginx/ssl/
sudo chown -R $USER:$USER nginx/ssl/
chmod 644 nginx/ssl/fullchain.pem
chmod 600 nginx/ssl/privkey.pem
```

