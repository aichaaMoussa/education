# 🔧 Fix: Problème DNS/IP - IPv6 vs IPv4

## Problème Identifié

Votre serveur a une IP IPv6 (`2a02:4780:28:69f0::1`) mais le DNS pointe vers une IPv4 (`84.32.84.32`).

Cela cause des problèmes avec Certbot car Let's Encrypt essaie de se connecter via IPv4 mais le serveur peut répondre via IPv6.

## Solution 1: Vérifier l'IP IPv4 Réelle du Serveur

```bash
# Vérifier toutes les IPs du serveur
hostname -I

# Vérifier l'IP IPv4 publique
curl -4 -s ifconfig.me

# Vérifier l'IP IPv6 publique
curl -6 -s ifconfig.me

# Voir toutes les interfaces réseau
ip addr show

# Vérifier quelle IP est utilisée pour les connexions sortantes IPv4
ip route get 8.8.8.8 | awk '{print $7}'
```

**Important:** Vérifiez que `84.32.84.32` est bien l'IP IPv4 publique de votre serveur.

## Solution 2: Vérifier/Corriger le DNS

```bash
# Vérifier le DNS actuel
dig +short itkane.net A
dig +short www.itkane.net A

# Vérifier l'IP IPv4 de votre serveur
MY_IPV4=$(curl -4 -s ifconfig.me)
echo "Votre IP IPv4: $MY_IPV4"
echo "DNS itkane.net: $(dig +short itkane.net A)"

# Les deux doivent correspondre !
```

**Si les IP ne correspondent pas:**

1. Allez dans votre gestionnaire DNS (Hostinger, Cloudflare, etc.)
2. Modifiez les records A pour `itkane.net` et `www.itkane.net`
3. Pointez-les vers l'IP IPv4 réelle de votre serveur
4. Attendez 10-30 minutes pour la propagation DNS

## Solution 3: Forcer Certbot à Utiliser IPv4

```bash
# Arrêter tous les services sur le port 80
sudo systemctl stop nginx 2>/dev/null || true
docker-compose down 2>/dev/null || true

# Obtenir le certificat en forçant IPv4
sudo certbot certonly --standalone \
  --preferred-chain "ISRG Root X1" \
  -4 \
  -d itkane.net -d www.itkane.net

# L'option -4 force Certbot à utiliser IPv4 uniquement
```

## Solution 4: DNS Challenge (RECOMMANDÉ - Pas de problème IP)

Le DNS Challenge ne nécessite pas d'accès HTTP, donc pas de problème IPv4/IPv6 :

```bash
# Utiliser DNS Challenge
sudo certbot certonly --manual --preferred-challenges dns \
  -d itkane.net -d www.itkane.net

# Certbot affichera des records TXT à ajouter dans votre DNS
# Suivez les instructions affichées
```

## Vérification Complète

```bash
# Script de vérification
echo "=== Vérification IP/DNS ==="
echo ""
echo "IP IPv4 du serveur:"
curl -4 -s ifconfig.me
echo ""
echo ""
echo "IP IPv6 du serveur:"
curl -6 -s ifconfig.me
echo ""
echo ""
echo "DNS itkane.net (A record):"
dig +short itkane.net A
echo ""
echo "DNS itkane.net (AAAA record - IPv6):"
dig +short itkane.net AAAA
echo ""
echo ""
echo "IPs locales:"
hostname -I
```

## Recommandation

**Utilisez le DNS Challenge** - C'est la solution la plus simple et la plus fiable :

```bash
sudo certbot certonly --manual --preferred-challenges dns \
  -d itkane.net -d www.itkane.net
```

Cette méthode :
- ✅ Ne nécessite pas d'accès au port 80
- ✅ Fonctionne même si le DNS pointe vers une IP différente
- ✅ Fonctionne avec IPv4 et IPv6
- ✅ Pas de problème de proxy/firewall

