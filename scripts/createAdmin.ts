// Script pour créer un utilisateur admin
import connectDB from '../lib/mongodb';
import User from '../models/User';
import Role from '../models/Role';
import { hashPassword } from '../lib/auth';
import { ROLE_PERMISSIONS } from '../lib/permissions';

async function createAdmin() {
  try {
    await connectDB();

    // Créer le rôle admin s'il n'existe pas
    let adminRole = await Role.findOne({ name: 'admin' });
    
    if (!adminRole) {
      const permissions = ROLE_PERMISSIONS.admin;
      adminRole = await Role.create({
        name: 'admin',
        permissions,
        description: 'Administrateur avec tous les droits',
      });
      console.log('✅ Rôle admin créé');
    } else {
      console.log('ℹ️  Rôle admin existe déjà');
    }

    // Demander les informations de l'admin
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const question = (query: string) => {
      return new Promise<string>((resolve) => {
        readline.question(query, resolve);
      });
    };

    const email = await question('Email de l\'admin: ');
    const password = await question('Mot de passe: ');
    const firstName = await question('Prénom: ');
    const lastName = await question('Nom: ');

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Mettre à jour l'utilisateur existant pour lui donner le rôle admin
      existingUser.role = adminRole._id;
      await existingUser.save();
      console.log('✅ Utilisateur existant mis à jour avec le rôle admin');
    } else {
      // Créer un nouvel utilisateur admin
      const hashedPassword = await hashPassword(password);
      const adminUser = await User.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: adminRole._id,
        isActive: true,
      });
      console.log('✅ Utilisateur admin créé avec succès');
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Nom: ${adminUser.firstName} ${adminUser.lastName}`);
    }

    readline.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error);
    process.exit(1);
  }
}

createAdmin();

