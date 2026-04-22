import type { Metadata } from 'next';
import React from 'react';
import '../styles/globals.css';
import AppProviders from './providers';

export const metadata: Metadata = {
  title: 'itkane — formations',
  description: 'Plateforme de formation itkane',
};

/**
 * Layout racine App Router : enveloppe uniquement les routes sous `app/`.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
