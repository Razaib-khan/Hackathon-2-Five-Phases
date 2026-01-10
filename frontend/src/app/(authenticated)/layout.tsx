'use client';

import ClientWrapper from '../../components/ClientWrapper';
import { ReactNode } from 'react';

export default function AuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ClientWrapper>
      {children}
    </ClientWrapper>
  );
}