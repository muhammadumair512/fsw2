'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

import { SnackbarProvider } from '@/components/providers/SnackbarProvider';

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <SnackbarProvider>
        {children}
      </SnackbarProvider>
    </SessionProvider>
  );
}

export default Providers;