'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/api';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user has a token stored
    const token = getToken();
    if (token) {
      // Redirect to dashboard page if authenticated
      router.push('/dashboard');
    } else {
      // Redirect to login if not authenticated
      router.push('/auth/login');
    }
  }, [router]);

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
