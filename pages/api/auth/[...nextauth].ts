import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import { verifyPassword } from '../../../lib/auth';
import '../../../models'; // Ensure models are registered

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
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email et mot de passe requis');
          }

          await connectDB();

          const user = await User.findOne({ email: credentials.email }).populate('role');

          if (!user) {
            throw new Error('Utilisateur non trouvé. Vérifiez votre email.');
          }

          if (!user.isActive) {
            throw new Error('Compte désactivé');
          }

          if (!user.password) {
            throw new Error('Erreur de configuration du compte');
          }

          const isValid = await verifyPassword(credentials.password, user.password);

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
};

export default NextAuth(authOptions);

