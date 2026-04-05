# 🔒 Activer HTTPS sur votre site

## Problème
Votre site est accessible en HTTP mais vous voulez forcer HTTPS.

## Solution

### 1. Vérifier les certificats SSL

```bash
# Vérifier que les certificats existent
ls -la nginx/ssl/

# Vous devriez voir:
# fullchain.pem
# privkey.pem
```

### 2. Si les certificats n'existent pas, les créer

**Option A: Let's Encrypt (Production)**
```bash
# Arrêter Docker
docker-compose down

# Arrêter Nginx sur l'hôte
sudo systemctl stop nginx 2>/dev/null || true

# Obtenir le certificat
sudo certbot certonly --standalone -4 -d itkane.net -d www.itkane.net

# Copier les certificats
mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/itkane.net/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/itkane.net/privkey.pem nginx/ssl/
sudo chown -R $USER:$USER nginx/ssl/
chmod 644 nginx/ssl/fullchain.pem
chmod 600 nginx/ssl/privkey.pem
```

**Option B: Certificats auto-signés (Test uniquement)**
```bash
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/privkey.pem \
  -out nginx/ssl/fullchain.pem \
  -subj "/C=MR/ST=State/L=City/O=ITekane/CN=itkane.net"
chmod 644 nginx/ssl/fullchain.pem
chmod 600 nginx/ssl/privkey.pem
```

### 3. Vérifier la configuration Nginx

La configuration Nginx est déjà correcte:
- ✅ Redirection HTTP → HTTPS (ligne 14: `return 301 https://$host$request_uri;`)
- ✅ Serveur HTTPS sur le port 443 (lignes 18-58)

Vérifiez que le fichier `nginx/conf.d/itekane.conf` contient bien:
- Un bloc `server` qui écoute sur le port 80 et redirige vers HTTPS
- Un bloc `server` qui écoute sur le port 443 avec SSL

### 4. Vérifier les variables d'environnement

```bash
# Vérifier .env.local
cat .env.local | grep -E "NEXTAUTH_URL|STORAGE_PUBLIC_URL"

# Ces valeurs DOIVENT être en HTTPS:
# NEXTAUTH_URL=https://itkane.net
# STORAGE_PUBLIC_URL=https://itkane.net/media
```

Si elles sont en HTTP, modifiez-les:
```bash
nano .env.local

# Changez:
# NEXTAUTH_URL=http://itkane.net  →  NEXTAUTH_URL=https://itkane.net
# STORAGE_PUBLIC_URL=http://itkane.net/media  →  STORAGE_PUBLIC_URL=https://itkane.net/media
```

### 5. Redémarrer les services

```bash
# Redémarrer Docker Compose
docker-compose restart nginx
docker-compose restart app

# Ou complètement
docker-compose down
docker-compose up -d
```

### 6. Vérifier HTTPS

```bash
# Tester depuis le serveur
curl -I https://itkane.net

# Depuis votre navigateur, vérifiez:
# 1. Que https://itkane.net fonctionne
# 2. Que http://itkane.net redirige automatiquement vers https://
```

## Dépannage

### Erreur: "SSL certificate not found"

```bash
# Vérifier que les certificats existent
ls -la nginx/ssl/

# Si vides, recréer les certificats (voir étape 2)
```

### Le site n'est toujours pas en HTTPS

```bash
# Vérifier les logs Nginx
docker-compose logs nginx | tail -50

# Vérifier la configuration Nginx
docker-compose exec nginx nginx -t

# Redémarrer Nginx
docker-compose restart nginx
```

### Le site affiche "Not Secure"

Cela signifie que vous utilisez des certificats auto-signés. Pour la production:
- Utilisez Let's Encrypt (gratuit)
- Ou achetez un certificat SSL valide

## Commandes Rapides

```bash
# 1. Vérifier certificats
ls -la nginx/ssl/

# 2. Vérifier variables d'environnement
grep -E "NEXTAUTH_URL|STORAGE_PUBLIC_URL" .env.local

# 3. Vérifier configuration Nginx
grep -E "listen|ssl_certificate|return 301" nginx/conf.d/itekane.conf

# 4. Redémarrer
docker-compose restart nginx app

# 5. Tester
curl -I https://itkane.net
```

