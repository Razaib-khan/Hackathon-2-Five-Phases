'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { session, isLoading } = useAuth();
  const [redirected, setRedirected] = useState(false);
  const router = useRouter();

  // Check if user is authenticated and redirect to dashboard if they are
  useEffect(() => {
    if (!isLoading && session && !redirected) {
      setRedirected(true);
      router.push('/dashboard');
    } else if (!isLoading && !session && !redirected) {
      setRedirected(true);
      router.push('/auth/login');
    }
  }, [session, isLoading, redirected, router]);

  if (isLoading || (session && !redirected) || (!session && !redirected)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 font-sans">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-between py-16 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 text-center w-full">
          {/* Loading spinner */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </main>
    </div>
  );
}
