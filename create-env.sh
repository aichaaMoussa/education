#!/bin/bash

# Script pour créer .env.local avec des valeurs par défaut

echo "🔧 Création du fichier .env.local..."

# Générer des secrets aléatoires
NEXTAUTH_SECRET=$(openssl rand -base64 32)
STORAGE_SECRET=$(openssl rand -base64 32)

<<<<<<< HEAD
# Fichier sans lignes "# ..." : l'ancien docker-compose (Python) signale souvent "could not parse line 3" avec des commentaires.
{
  echo "MONGODB_URI=mongodb://mongo:27017/education"
  echo "NEXTAUTH_URL=https://itkane.net"
  echo "NEXTAUTH_SECRET=$NEXTAUTH_SECRET"
  echo "SUPER_ADMIN_EMAIL=admin@itkane.net"
  echo 'SUPER_ADMIN_PASSWORD="ChangeMe123!"'
  echo "SUPER_ADMIN_FIRSTNAME=Super"
  echo "SUPER_ADMIN_LASTNAME=Admin"
  echo "STORAGE_ROOT=/srv/itekane-storage"
  echo "STORAGE_PUBLIC_URL=https://itkane.net/media"
  echo "STORAGE_SECRET=$STORAGE_SECRET"
  echo "MAX_UPLOAD_SIZE=104857600"
  echo "BANKILY_MERCHANT_USERNAME=your-bankily-merchant-username"
  echo "BANKILY_MERCHANT_PASSWORD=your-bankily-merchant-password"
} > .env.local
=======
# Créer le fichier .env.local
cat > .env.local << EOF
# Database Connection
MONGODB_URI=mongodb://mongo:27017/education

# NextAuth Configuration
NEXTAUTH_URL=https://itkane.net
NEXTAUTH_SECRET=$NEXTAUTH_SECRET

# Super Admin Credentials
SUPER_ADMIN_EMAIL=admin@itkane.net
SUPER_ADMIN_PASSWORD=ChangeMe123!
SUPER_ADMIN_FIRSTNAME=Super
SUPER_ADMIN_LASTNAME=Admin

# Storage Configuration
STORAGE_ROOT=/srv/itekane-storage
STORAGE_PUBLIC_URL=https://itkane.net/media
STORAGE_SECRET=$STORAGE_SECRET
MAX_UPLOAD_SIZE=104857600

# Bankily Payment
BANKILY_MERCHANT_USERNAME=your-bankily-merchant-username
BANKILY_MERCHANT_PASSWORD=your-bankily-merchant-password
EOF
>>>>>>> b00e06faa2b3d33ad952c46382d13a7cb7d1b6a4

echo "✅ Fichier .env.local créé !"
echo ""
echo "⚠️  IMPORTANT: Modifiez les valeurs suivantes:"
echo "   - SUPER_ADMIN_PASSWORD (actuellement: ChangeMe123!)"
echo "   - BANKILY_MERCHANT_USERNAME"
echo "   - BANKILY_MERCHANT_PASSWORD"
echo ""
echo "Pour éditer: nano .env.local"

