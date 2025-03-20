import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { prisma } from '@/lib/prisma';

import AuthError, { AuthErrorType } from '../handlers/errors/types/AuthError';

export const options: NextAuthOptions = {
  providers: [
    Credentials({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async credentials => {
        if (!credentials?.email || !credentials?.password) {
          throw new AuthError(AuthErrorType.MISSING_FIELDS, 400);
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        });

        if (!user) {
          throw new AuthError(AuthErrorType.USER_NOT_FOUND, 404);
        }

        const isValidPassword =
          (credentials.password as string) === user.password;

        if (!isValidPassword) {
          throw new AuthError(AuthErrorType.INVALID_CREDENTIALS, 401);
        }

        return {
          id: user.id,
          email: user.email,
          name: user.username,
          role: user.role,
        };
      },
    }),
  ],
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id as string,
        role: token.role as string,
        email: token.email as string,
        name: token.name as string,
      };

      return session;
    },
  },
};
