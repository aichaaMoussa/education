'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import ToastProvider from '@/components/ui/Toast';

/**
 * Providers partagés par les routes App Router (NextAuth + toasts).
 * Les routes `pages/` continuent d’utiliser `pages/_app.tsx`.
 */
export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <ToastProvider />
      {children}
    </SessionProvider>
  );
}
