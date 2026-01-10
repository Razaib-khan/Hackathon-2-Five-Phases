'use client';

import { AuthProvider } from '@/hooks/useAuth';

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}