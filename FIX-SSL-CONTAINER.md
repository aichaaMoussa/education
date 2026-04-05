# 🔧 Fix: Certificats Let's Encrypt non reconnus dans le conteneur

## Problème
Le site affiche toujours "Non sécurisé" même avec les certificats Let's Encrypt copiés.

## Causes Possibles

### 1. Les certificats ne sont pas montés correctement dans le conteneur

Le volume `./nginx/ssl:/etc/nginx/ssl:ro` doit être en lecture seule, mais vérifiez que les fichiers sont bien présents dans le conteneur.

### 2. Nginx utilise encore les anciens certificats (cache)

Le conteneur Nginx doit être complètement redémarré pour charger les nouveaux certificats.

### 3. Contenu mixte (HTTP/HTTPS)

Si votre site charge des ressources (images, CSS, JS) en HTTP au lieu de HTTPS, le navigateur affichera "Non sécurisé".

## Solutions

### Solution 1: Vérifier que les certificats sont dans le conteneur

```bash
# Vérifier que les certificats sont montés dans le conteneur
docker-compose exec nginx ls -lh /etc/nginx/ssl/

# Vérifier que Nginx peut lire les certificats
docker-compose exec nginx openssl x509 -in /etc/nginx/ssl/fullchain.pem -noout -issuer

# Si les certificats ne sont pas là ou ne sont pas les bons, recopier
sudo cp /etc/letsencrypt/live/itkane.net/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/itkane.net/privkey.pem nginx/ssl/
sudo chown -R $USER:$USER nginx/ssl/
```

### Solution 2: Forcer le rechargement complet de Nginx

```bash
# Arrêter complètement
docker-compose down

# Attendre quelques secondes
sleep 3

# Redémarrer
docker-compose up -d

# Attendre le démarrage
sleep 10

# Vérifier que les certificats Let's Encrypt sont chargés
docker-compose exec nginx openssl x509 -in /etc/nginx/ssl/fullchain.pem -noout -issuer -dates
```

### Solution 3: Vérifier le contenu mixte

```bash
# Vérifier les logs Nginx pour les erreurs de certificat
docker-compose logs nginx | grep -i ssl
docker-compose logs nginx | grep -i certificate

# Vérifier la configuration Nginx
docker-compose exec nginx nginx -t
```

### Solution 4: Vérifier que les certificats sont bien Let's Encrypt

```bash
# Dans le conteneur
docker-compose exec nginx openssl x509 -in /etc/nginx/ssl/fullchain.pem -noout -issuer

# Devrait afficher: issuer=C = US, O = Let's Encrypt, CN = ...
# Si ça affiche autre chose, les certificats ne sont pas les bons
```

## Diagnostic Complet

```bash
echo "=== Diagnostic SSL ==="
echo ""
echo "1. Certificats sur l'hôte:"
ls -lh nginx/ssl/*.pem
openssl x509 -in nginx/ssl/fullchain.pem -noout -issuer -dates

echo ""
echo "2. Certificats dans le conteneur:"
docker-compose exec nginx ls -lh /etc/nginx/ssl/ 2>&1 || echo "Erreur accès conteneur"
docker-compose exec nginx openssl x509 -in /etc/nginx/ssl/fullchain.pem -noout -issuer -dates 2>&1 || echo "Erreur lecture certificat"

echo ""
echo "3. Configuration Nginx:"
docker-compose exec nginx nginx -t

echo ""
echo "4. Test HTTPS:"
curl -v https://itkane.net 2>&1 | grep -E "SSL|certificate|issuer" | head -5

echo ""
echo "5. Logs Nginx SSL:"
docker-compose logs nginx | grep -i "ssl\|certificate\|error" | tail -10
```

## Solution Rapide (Tout en un)

```bash
# 1. S'assurer que les certificats sont bien copiés
sudo cp /etc/letsencrypt/live/itkane.net/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/itkane.net/privkey.pem nginx/ssl/
sudo chown -R $USER:$USER nginx/ssl/

# 2. Redémarrer complètement
docker-compose down
sleep 3
docker-compose up -d

# 3. Attendre et vérifier
sleep 10
echo "=== Vérification ==="
docker-compose exec nginx openssl x509 -in /etc/nginx/ssl/fullchain.pem -noout -issuer

# 4. Tester HTTPS
curl -v https://itkane.net 2>&1 | grep -E "SSL|issuer" | head -3
```

## Vérification dans le Navigateur

1. **Vider complètement le cache** :
   - Chrome/Edge: Ctrl+Shift+Delete → Cochez "Images et fichiers en cache" → Effacer
   - Firefox: Ctrl+Shift+Delete → Cochez "Cache" → Effacer

2. **Tester en navigation privée** :
   - Chrome: Ctrl+Shift+N
   - Firefox: Ctrl+Shift+P

3. **Vérifier les outils développeur** :
   - F12 → Onglet "Sécurité" ou "Security"
   - Cliquez sur le cadenas dans la barre d'adresse
   - Vérifiez "Le certificat est valide" et "Let's Encrypt"

4. **Vérifier l'URL** :
   - Assurez-vous d'être sur `https://itkane.net` (pas `http://`)
   - Vérifiez qu'il n'y a pas de redirection vers HTTP

