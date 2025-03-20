'use client';

import { Button } from '@mui/material';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Navbar() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const isAdmin = session?.user?.isAdmin;

  return (
    <nav className="bg-white shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Family Services
        </Link>

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <span className="text-gray-700">
                Hello, {session?.user?.name}
              </span>
              
              {isAdmin && (
                <Link href="/admin">
                  <Button variant="outlined" color="primary">
                    Admin Panel
                  </Button>
                </Link>
              )}
              
              {!isAdmin && (
                <Link href="/dashboard">
                  <Button variant="outlined" color="primary">
                    Dashboard
                  </Button>
                </Link>
              )}
              
              <Button
                variant="contained"
                color="primary"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Button variant="contained" color="primary">
              <Link href="/" className="text-white">
                Sign In / Register
              </Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}