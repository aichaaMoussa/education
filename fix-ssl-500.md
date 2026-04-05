# 🔧 Fix: Erreur 500 lors de l'obtention du certificat SSL

## Problème
Certbot retourne une erreur 500 même après avoir libéré le port 80 :
```
Invalid response from http://itkane.net/.well-known/acme-challenge/...: 500
```

## Causes Possibles

### 1. Problème IPv4/IPv6 (Votre Cas)

Votre serveur a une IP IPv6 mais le DNS pointe vers IPv4, ou vice versa :

```bash
# Vérifier les IPs
echo "IP IPv4: $(curl -4 -s ifconfig.me)"
echo "IP IPv6: $(curl -6 -s ifconfig.me)"
echo "DNS (A): $(dig +short itkane.net A)"
echo "DNS (AAAA): $(dig +short itkane.net AAAA)"

# Vérifier que l'IP IPv4 correspond au DNS
MY_IPV4=$(curl -4 -s ifconfig.me)
DNS_IPV4=$(dig +short itkane.net A)
if [ "$MY_IPV4" != "$DNS_IPV4" ]; then
    echo "⚠️ IP IPv4 et DNS ne correspondent pas!"
    echo "   Serveur IPv4: $MY_IPV4"
    echo "   DNS IPv4: $DNS_IPV4"
fi
```

**Solution:** Utilisez le **DNS Challenge** (voir ci-dessous) qui ne dépend pas de l'IP.

### 2. Le domaine ne pointe pas vers ce serveur (DNS)

Vérifier le DNS :
```bash
# Vérifier que le domaine pointe vers cette IP
dig itkane.net +short
nslookup itkane.net

# Vérifier votre IP publique
curl -4 -s ifconfig.me

# Les deux doivent correspondre !
```

Si le domaine ne pointe pas vers cette IP, modifiez les records DNS :
- **Type A** : `itkane.net` → IP de votre serveur (ex: 84.32.84.32)
- **Type A** : `www.itkane.net` → IP de votre serveur (ex: 84.32.84.32)

### 2. Proxy/Firewall intermédiaire (Cloudflare, etc.)

Si vous utilisez Cloudflare ou un autre proxy :
- **Désactivez temporairement le proxy** (mode DNS only, pas proxy)
- Ou utilisez le **DNS Challenge** (voir ci-dessous)

### 3. Firewall Hostinger

Vérifier dans le panneau Hostinger :
- Firewall → Autoriser les ports 80 et 443
- Ou désactiver temporairement le firewall pour les tests

## Solution Recommandée: DNS Challenge

Le DNS Challenge ne nécessite **PAS** d'accès au port 80. C'est la meilleure solution si vous avez des problèmes de DNS/proxy.

```bash
# Utiliser DNS Challenge
sudo certbot certonly --manual --preferred-challenges dns \
  -d itkane.net -d www.itkane.net

# Certbot affichera des instructions comme:
# Please deploy a DNS TXT record under the name
# _acme-challenge.itkane.net with the following value:
#
# xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
#
# Press Enter to Continue

# 1. Ouvrez un nouvel onglet/terminal pour ne pas interrompre Certbot
# 2. Allez dans votre gestionnaire DNS (Hostinger, Cloudflare, etc.)
# 3. Ajoutez un record TXT:
#    Nom: _acme-challenge.itkane.net
#    Valeur: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (la valeur affichée par Certbot)
# 4. Pour www, ajoutez aussi:
#    Nom: _acme-challenge.www.itkane.net
#    Valeur: yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy (la deuxième valeur)
# 5. Attendez 1-2 minutes pour la propagation DNS
# 6. Revenez au terminal de Certbot et appuyez sur Enter

# Après succès, copier les certificats
mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/itkane.net/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/itkane.net/privkey.pem nginx/ssl/
sudo chown -R $USER:$USER nginx/ssl/
chmod 644 nginx/ssl/fullchain.pem
chmod 600 nginx/ssl/privkey.pem
```

## Vérifications Avant Certbot

```bash
# 1. Vérifier le port 80 est libre
sudo netstat -tlnp | grep :80
# Rien ne doit apparaître

# 2. Vérifier que le domaine pointe vers cette IP
MY_IP=$(curl -s ifconfig.me)
DNS_IP=$(dig +short itkane.net)
echo "Votre IP: $MY_IP"
echo "DNS IP: $DNS_IP"
# Elles doivent correspondre !

# 3. Tester depuis l'extérieur si le port 80 est accessible
# Utilisez https://www.yougetsignal.com/tools/open-ports/
# ou depuis un autre serveur:
# curl -I http://itkane.net

# 4. Vérifier les logs de Certbot pour plus de détails
sudo tail -50 /var/log/letsencrypt/letsencrypt.log
```

## Solution Alternative: Certificats Auto-signés Temporaires

Si vous voulez juste tester le déploiement :

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

## Commandes Rapides

```bash
# Vérifier DNS et IP
echo "Votre IP: $(curl -s ifconfig.me)"
echo "DNS itkane.net: $(dig +short itkane.net)"
echo "DNS www.itkane.net: $(dig +short www.itkane.net)"

# Si les IP correspondent, utiliser DNS Challenge
sudo certbot certonly --manual --preferred-challenges dns \
  -d itkane.net -d www.itkane.net

# Après succès
mkdir -p nginx/ssl && \
sudo cp /etc/letsencrypt/live/itkane.net/*.pem nginx/ssl/ && \
sudo chown -R $USER:$USER nginx/ssl/ && \
chmod 644 nginx/ssl/fullchain.pem && \
chmod 600 nginx/ssl/privkey.pem
```

