#!/bin/bash

set -e

echo "🔒 Obtention des certificats SSL avec Let's Encrypt..."

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier que Certbot est installé
if ! command -v certbot &> /dev/null; then
    info "Installation de Certbot..."
    sudo apt update
    sudo apt install certbot -y
fi

# Vérifier quel service utilise le port 80
info "Vérification du port 80..."
PORT_80_USERS=$(sudo netstat -tlnp 2>/dev/null | grep :80 || true)

if [ -n "$PORT_80_USERS" ]; then
    warn "Des services utilisent le port 80:"
    echo "$PORT_80_USERS"
    warn "Arrêt des services pour libérer le port 80..."
    
    # Arrêter Nginx
    if systemctl is-active --quiet nginx 2>/dev/null; then
        info "Arrêt de Nginx..."
        sudo systemctl stop nginx
    fi
    
    # Arrêter Apache
    if systemctl is-active --quiet apache2 2>/dev/null; then
        info "Arrêt d'Apache..."
        sudo systemctl stop apache2
    fi
    
    # Arrêter Docker Compose si présent
    if [ -f docker-compose.yml ] && docker-compose ps 2>/dev/null | grep -q "Up"; then
        warn "Arrêt des conteneurs Docker..."
        docker-compose down
    fi
fi

# Vérifier que le port 80 est maintenant libre
sleep 2
PORT_80_CHECK=$(sudo netstat -tlnp 2>/dev/null | grep :80 || true)

if [ -n "$PORT_80_CHECK" ]; then
    error "Le port 80 est toujours utilisé. Veuillez arrêter manuellement les services."
    echo "$PORT_80_CHECK"
    exit 1
fi

info "✅ Port 80 est libre"

# Ouvrir les ports dans le firewall
info "Configuration du firewall..."
sudo ufw allow 80/tcp 2>/dev/null || true
sudo ufw allow 443/tcp 2>/dev/null || true

# Obtenir le certificat
info "Obtention du certificat SSL..."
if sudo certbot certonly --standalone -d itkane.net -d www.itkane.net; then
    info "✅ Certificat obtenu avec succès!"
    
    # Créer le répertoire SSL
    mkdir -p nginx/ssl
    
    # Copier les certificats
    if [ -f /etc/letsencrypt/live/itkane.net/fullchain.pem ]; then
        info "Copie des certificats..."
        sudo cp /etc/letsencrypt/live/itkane.net/fullchain.pem nginx/ssl/
        sudo cp /etc/letsencrypt/live/itkane.net/privkey.pem nginx/ssl/
        sudo chown -R $USER:$USER nginx/ssl/
        chmod 644 nginx/ssl/fullchain.pem
        chmod 600 nginx/ssl/privkey.pem
        info "✅ Certificats copiés dans nginx/ssl/"
    else
        error "Certificats non trouvés dans /etc/letsencrypt/live/itkane.net/"
        exit 1
    fi
else
    error "Échec de l'obtention du certificat"
    exit 1
fi

echo ""
info "✅ SSL configuré avec succès!"
echo ""
warn "📝 Vous pouvez maintenant redémarrer vos services Docker:"
echo "   docker-compose up -d"
echo ""
info "📖 Pour le renouvellement automatique, ajoutez un cron job:"
echo "   sudo crontab -e"
echo "   Ajouter: 0 0 1 * * certbot renew --quiet && docker-compose restart nginx"

