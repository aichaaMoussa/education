// scripts/initSuperAdmin.ts
// Script pour initialiser le super admin depuis les variables d'environnement
import dotenv from 'dotenv';
import { resolve } from 'path';

// Charger les variables d'environnement depuis .env.local
// ts-node utilise __dirname en CommonJS
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import connectDB from '../lib/mongodb';
import User from '../models/User';
import Role from '../models/Role';
import { hashPassword } from '../lib/auth';
import { ROLE_PERMISSIONS } from '../lib/permissions';

async function initSuperAdmin() {
  try {
    await connectDB();

    // Vérifier que les variables d'environnement sont définies
    const email = process.env.SUPER_ADMIN_EMAIL;
    const password = process.env.SUPER_ADMIN_PASSWORD;
    const firstName = process.env.SUPER_ADMIN_FIRSTNAME;
    const lastName = process.env.SUPER_ADMIN_LASTNAME;

    if (!email || !password || !firstName || !lastName) {
      console.error('❌ Erreur: Les variables d\'environnement suivantes sont requises:');
      console.error('   - SUPER_ADMIN_EMAIL');
      console.error('   - SUPER_ADMIN_PASSWORD');
      console.error('   - SUPER_ADMIN_FIRSTNAME');
      console.error('   - SUPER_ADMIN_LASTNAME');
      process.exit(1);
    }

    // Créer tous les rôles s'ils n'existent pas
    for (const [roleName, permissions] of Object.entries(ROLE_PERMISSIONS)) {
      let role = await Role.findOne({ name: roleName });
      if (!role) {
        role = await Role.create({
          name: roleName,
          permissions,
          description: `Rôle ${roleName} avec permissions par défaut`,
        });
        console.log(`✅ Rôle ${roleName} créé`);
      }
    }

    const adminRole = await Role.findOne({ name: 'admin' });

    if (!adminRole) {
      console.error('❌ Erreur: Le rôle admin n\'existe pas');
      process.exit(1);
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Mettre à jour l'utilisateur existant
      existingUser.role = adminRole._id;
      existingUser.firstName = firstName;
      existingUser.lastName = lastName;
      existingUser.isActive = true;
      
      // Mettre à jour le mot de passe si nécessaire
      if (password) {
        existingUser.password = await hashPassword(password);
      }
      
      await existingUser.save();
      console.log('✅ Super admin existant mis à jour avec succès');
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Nom: ${existingUser.firstName} ${existingUser.lastName}`);
    } else {
      // Créer le super admin
      const hashedPassword = await hashPassword(password);
      const superAdmin = await User.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: adminRole._id,
        isActive: true,
      });
      console.log('✅ Super admin créé avec succès');
      console.log(`   Email: ${superAdmin.email}`);
      console.log(`   Nom: ${superAdmin.firstName} ${superAdmin.lastName}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation du super admin:', error);
    process.exit(1);
  }
}

initSuperAdmin();

