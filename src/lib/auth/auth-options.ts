import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { compare } from 'bcryptjs';
import { NextAuthOptions, Session } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import { prisma } from '../prisma';
import AuthError, { AuthErrorType } from '../handlers/errors/types/AuthError';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      isAdmin: boolean;
    };
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: '/',
    error: '/?error=auth',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
    // Update the authorize function inside auth-options.ts
async authorize(credentials) {
  if (!credentials?.email || !credentials?.password) {
    throw new Error('Email and password are required');
  }

  const user = await prisma.user.findUnique({
    where: {
      email: credentials.email,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const isPasswordValid = await compare(
    credentials.password,
    user.password
  );

  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  // Check if user is approved, except for admin
  if (!user.isApproved && !user.isAdmin) {
    throw new Error('Your account is pending approval. Please check your email for updates.');
  }

  return {
    id: user.id,
    email: user.email,
    name: `${user.firstName} ${user.lastName}`,
    isAdmin: user.isAdmin,
    role: user.isAdmin ? 'admin' : 'family', // Add role property
  };
}
    }),
  ],
 // Update these callbacks in the authOptions to properly set isAdmin
callbacks: {
  async jwt({ token, user }) {
    // On first sign in, add user info to token
    if (user) {
      console.log("Setting JWT token with user:", user);
      token.id = user.id;
      token.email = user.email;
      token.name = user.name;
      token.isAdmin = !!user.isAdmin;
    }
    return token;
  },
  async session({ session, token }) {
    console.log("Creating session from token:", token);
    // Add user ID and admin status to session
    if (token && session.user) {
      session.user.id = token.id as string;
      session.user.email = token.email as string;
      session.user.name = token.name as string;
      session.user.isAdmin = !!token.isAdmin;
    }
    return session;
  },
},

  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
};


