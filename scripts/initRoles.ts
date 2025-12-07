// Script pour initialiser les rôles par défaut
const connectDB = require('../lib/mongodb').default;
const Role = require('../models/Role').default;
const { ROLE_PERMISSIONS } = require('../lib/permissions');

async function initRoles() {
  try {
    await connectDB();

    for (const [roleName, permissions] of Object.entries(ROLE_PERMISSIONS)) {
      const existingRole = await Role.findOne({ name: roleName });
      
      if (!existingRole) {
        await Role.create({
          name: roleName,
          permissions,
          description: `Rôle ${roleName} avec permissions par défaut`,
        });
        console.log(`✅ Rôle ${roleName} créé`);
      } else {
        console.log(`ℹ️  Rôle ${roleName} existe déjà`);
      }
    }

    console.log('✅ Initialisation des rôles terminée');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
}

initRoles();

