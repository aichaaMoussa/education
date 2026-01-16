#!/bin/bash

set -e

echo "🚀 Déploiement de l'application ITEKANE..."

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    error "Docker n'est pas installé. Installez Docker d'abord."
    exit 1
fi

# Vérifier que Docker Compose est installé
if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose n'est pas installé. Installez Docker Compose d'abord."
    exit 1
fi

info "Vérification des prérequis..."

# Vérifier que .env.local existe
if [ ! -f .env.local ]; then
    error ".env.local n'existe pas. Créez-le d'abord."
    exit 1
fi

# Créer le répertoire de stockage si nécessaire
info "Création du répertoire de stockage..."
sudo mkdir -p /srv/itekane-storage/{images,videos,documents,default}
sudo chown -R $USER:$USER /srv/itekane-storage
chmod -R 755 /srv/itekane-storage

# Vérifier/créer les certificats SSL
if [ ! -f nginx/ssl/fullchain.pem ] || [ ! -f nginx/ssl/privkey.pem ]; then
    warn "Certificats SSL non trouvés."
    
    # Essayer de copier depuis Let's Encrypt
    if [ -f /etc/letsencrypt/live/itkane.net/fullchain.pem ]; then
        info "Copie des certificats Let's Encrypt..."
        mkdir -p nginx/ssl
        sudo cp /etc/letsencrypt/live/itkane.net/fullchain.pem nginx/ssl/
        sudo cp /etc/letsencrypt/live/itkane.net/privkey.pem nginx/ssl/
        sudo chown -R $USER:$USER nginx/ssl/
        chmod 644 nginx/ssl/fullchain.pem
        chmod 600 nginx/ssl/privkey.pem
        info "✅ Certificats Let's Encrypt copiés"
    else
        warn "Certificats Let's Encrypt non trouvés. Génération de certificats auto-signés temporaires..."
        mkdir -p nginx/ssl
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/privkey.pem \
            -out nginx/ssl/fullchain.pem \
            -subj "/C=MR/ST=State/L=City/O=ITekane/CN=itkane.net"
        chmod 644 nginx/ssl/fullchain.pem
        chmod 600 nginx/ssl/privkey.pem
        warn "⚠️  Certificats auto-signés créés. Remplacez-les par des certificats Let's Encrypt en production."
        warn "📖 Voir FIX-SSL.md pour obtenir des certificats Let's Encrypt"
    fi
else
    info "✅ Certificats SSL trouvés"
fi

# Build des images
info "Build des images Docker..."
docker-compose build

# Arrêter les services existants
info "Arrêt des services existants..."
docker-compose down

# Démarrer les services
info "Démarrage des services..."
docker-compose up -d

# Attendre que les services soient prêts
info "Attente du démarrage des services..."
sleep 10

# Vérifier le statut
info "Vérification du statut des conteneurs..."
docker-compose ps

# Attendre que MongoDB soit prêt
info "Attente que MongoDB soit prêt..."
sleep 20

# Initialiser la base de données
info "Initialisation de la base de données..."

if docker-compose exec -T app npm run init:roles 2>/dev/null; then
    info "✅ Rôles initialisés"
else
    warn "⚠️ Erreur lors de l'initialisation des rôles (peut-être déjà initialisés)"
fi

if docker-compose exec -T app npm run init:super-admin 2>/dev/null; then
    info "✅ Super admin créé"
else
    warn "⚠️ Erreur lors de la création du super admin (peut-être déjà créé)"
fi

# Afficher les informations finales
info "✅ Déploiement terminé!"
echo ""
echo "📋 Informations importantes:"
echo "  - Application: https://itkane.net"
echo "  - Média: https://itkane.net/media/"
echo ""
echo "📊 Commandes utiles:"
echo "  - Voir les logs: docker-compose logs -f"
echo "  - Arrêter: docker-compose down"
echo "  - Redémarrer: docker-compose restart"
echo ""
echo "🔍 Vérification du statut:"
docker-compose ps

