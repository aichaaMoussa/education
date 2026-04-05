// scripts/createAdminSimple.ts
import connectDB from '../lib/mongodb';
import User from '../models/User';
import Role from '../models/Role';
import { hashPassword } from '../lib/auth';
import { ROLE_PERMISSIONS } from '../lib/permissions';

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

    // Infos du super admin depuis les variables d'environnement
    const email = process.env.SUPER_ADMIN_EMAIL || 'admin@education.com';
    const password = process.env.SUPER_ADMIN_PASSWORD || 'admin123';
    const firstName = process.env.SUPER_ADMIN_FIRSTNAME || 'Super';
    const lastName = process.env.SUPER_ADMIN_LASTNAME || 'Admin';

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      existingUser.role = adminRole!._id;
      await existingUser.save();
      console.log('✅ Utilisateur existant mis à jour avec le rôle admin');
      console.log(`   Email: ${existingUser.email}`);
    } else {
      const hashedPassword = await hashPassword(password);
      const adminUser = await User.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: adminRole!._id,
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
