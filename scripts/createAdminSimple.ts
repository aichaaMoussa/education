// Script simplifié pour créer un utilisateur admin (sans interaction)
const connectDB = require('../lib/mongodb').default;
const User = require('../models/User').default;
const Role = require('../models/Role').default;
const { hashPassword } = require('../lib/auth');
const { ROLE_PERMISSIONS } = require('../lib/permissions');

async function createAdmin() {
  try {
    await connectDB();

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

    // Informations par défaut pour l'admin
    const email = process.env.ADMIN_EMAIL || 'admin@education.com';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const firstName = process.env.ADMIN_FIRSTNAME || 'Admin';
    const lastName = process.env.ADMIN_LASTNAME || 'User';

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Mettre à jour l'utilisateur existant pour lui donner le rôle admin
      existingUser.role = adminRole._id;
      await existingUser.save();
      console.log('✅ Utilisateur existant mis à jour avec le rôle admin');
      console.log(`   Email: ${existingUser.email}`);
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
      console.log(`   Mot de passe: ${password}`);
      console.log(`   Nom: ${adminUser.firstName} ${adminUser.lastName}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error);
    process.exit(1);
  }
}

createAdmin();

