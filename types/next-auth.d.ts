import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      firstName?: string;
      lastName?: string;
      role?: {
        id: string;
        name: string;
        permissions: string[];
      };
    };
  }

  interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role?: {
      id: string;
      name: string;
      permissions: string[];
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    firstName?: string;
    lastName?: string;
    role?: {
      id: string;
      name: string;
      permissions: string[];
    };
  }
}

