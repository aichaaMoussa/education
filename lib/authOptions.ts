import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from './mongodb';
import User from '../models/User';
import Role from '../models/Role';
import { verifyPassword } from './auth';
import '../models'; // Ensure models are registered

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
<<<<<<< HEAD
          const email = credentials?.email?.trim();
          const password = credentials?.password?.trim();
          if (!email || !password) {
            throw new Error('Email et mot de passe requis');
          }

          const normalizedEmail = email.toLowerCase();

          // Vérifier les identifiants Super Admin depuis .env.local
          const superAdminEmail = process.env.SUPER_ADMIN_EMAIL?.trim();
          const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD?.trim();
          const superAdminFirstName =
            process.env.SUPER_ADMIN_FIRSTNAME?.trim() || 'Super';
          const superAdminLastName =
            process.env.SUPER_ADMIN_LASTNAME?.trim() || 'Admin';
=======
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email et mot de passe requis');
          }

          // Vérifier les identifiants Super Admin depuis .env.local
          const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
          const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
          const superAdminFirstName = process.env.SUPER_ADMIN_FIRSTNAME || 'Super';
          const superAdminLastName = process.env.SUPER_ADMIN_LASTNAME || 'Admin';
>>>>>>> b00e06faa2b3d33ad952c46382d13a7cb7d1b6a4

          if (
            superAdminEmail &&
            superAdminPassword &&
<<<<<<< HEAD
            normalizedEmail === superAdminEmail.toLowerCase() &&
            password === superAdminPassword
=======
            credentials.email === superAdminEmail &&
            credentials.password === superAdminPassword
>>>>>>> b00e06faa2b3d33ad952c46382d13a7cb7d1b6a4
          ) {
            // Connexion en tant que Super Admin
            await connectDB();

            // Trouver ou créer le rôle admin
            let adminRole = await Role.findOne({ name: 'admin' });
            
            if (!adminRole) {
              // Si le rôle admin n'existe pas, créer un rôle admin par défaut
              adminRole = await Role.create({
                name: 'admin',
                permissions: ['*'], // Toutes les permissions
                description: 'Administrateur avec tous les droits',
              });
            }

            return {
              id: 'super-admin',
<<<<<<< HEAD
              email: superAdminEmail.toLowerCase(),
=======
              email: superAdminEmail,
>>>>>>> b00e06faa2b3d33ad952c46382d13a7cb7d1b6a4
              name: `${superAdminFirstName} ${superAdminLastName}`,
              firstName: superAdminFirstName,
              lastName: superAdminLastName,
              role: {
                id: adminRole._id.toString(),
                name: adminRole.name,
                permissions: adminRole.permissions || ['*'],
              },
            };
          }

          // Authentification normale via la base de données
          await connectDB();

<<<<<<< HEAD
          const user = await User.findOne({ email: normalizedEmail }).populate(
            'role'
          );
=======
          const user = await User.findOne({ email: credentials.email }).populate('role');
>>>>>>> b00e06faa2b3d33ad952c46382d13a7cb7d1b6a4

          if (!user) {
            throw new Error('Utilisateur non trouvé. Vérifiez votre email.');
          }

          if (!user.isActive) {
            throw new Error('Compte désactivé');
          }

          if (!user.password) {
            throw new Error('Erreur de configuration du compte');
          }

<<<<<<< HEAD
          const isValid = await verifyPassword(password, user.password);
=======
          const isValid = await verifyPassword(credentials.password, user.password);
>>>>>>> b00e06faa2b3d33ad952c46382d13a7cb7d1b6a4

          if (!isValid) {
            throw new Error('Mot de passe incorrect');
          }

          if (!user.role) {
            throw new Error('Erreur de configuration du compte: rôle manquant');
          }

          const role = user.role as any;

          return {
            id: user._id.toString(),
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            firstName: user.firstName,
            lastName: user.lastName,
            role: {
              id: role._id.toString(),
              name: role.name,
              permissions: role.permissions || [],
            },
          };
        } catch (error: any) {
          console.error('❌ Erreur d\'authentification:', error.message);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.firstName = (user as any).firstName;
        token.lastName = (user as any).lastName;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session as any).user.id = token.id;
        (session as any).user.firstName = token.firstName;
        (session as any).user.lastName = token.lastName;
        (session as any).user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: false,
};
