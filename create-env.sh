#!/bin/bash

# Script pour créer .env.local avec des valeurs par défaut

echo "🔧 Création du fichier .env.local..."

# Générer des secrets aléatoires
NEXTAUTH_SECRET=$(openssl rand -base64 32)
STORAGE_SECRET=$(openssl rand -base64 32)

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

echo "✅ Fichier .env.local créé !"
echo ""
echo "⚠️  IMPORTANT: Modifiez les valeurs suivantes:"
echo "   - SUPER_ADMIN_PASSWORD (actuellement: ChangeMe123!)"
echo "   - BANKILY_MERCHANT_USERNAME"
echo "   - BANKILY_MERCHANT_PASSWORD"
echo ""
echo "Pour éditer: nano .env.local"

