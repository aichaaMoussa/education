import NextAuth from 'next-auth';
import { authOptions } from '../../../lib/authOptions';

// Réexport pour compatibilité, mais utilise maintenant authOptions depuis lib
export { authOptions };

export default NextAuth(authOptions);

