import { AdapterUser as DefaultAdapterUser } from '@auth/core/adapters';

declare module 'next-auth' {
  interface User {
    role: string;
  }
  interface Session {
    user: {
      id: string;
      username: string;
      email: string;
      role: string;
      name: string;
    };
  }
  interface AdapterUser extends DefaultAdapterUser {
    role: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
  }
}
