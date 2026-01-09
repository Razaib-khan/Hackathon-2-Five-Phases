'use client';

import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean; // If true, user must be authenticated to see content
}

export default function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        // Redirect to login if authentication is required and user is not authenticated
        router.push('/auth/login');
      } else if (!requireAuth && isAuthenticated) {
        // Redirect away from login/register pages if already authenticated
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading...</p>
      </div>
    );
  }

  // If authentication is required and user is not authenticated, don't render children
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // If authentication is not required but user is authenticated, don't render children
  if (!requireAuth && isAuthenticated) {
    return null;
  }

  // Render children if all conditions are met
  return <>{children}</>;
}