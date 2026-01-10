'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { session, isLoading } = useAuth();
  const [redirected, setRedirected] = useState(false);

  // Check if user is authenticated and redirect to dashboard if they are
  useEffect(() => {
    if (!isLoading && session && !redirected) {
      setRedirected(true);
      window.location.href = '/dashboard';
    }
  }, [session, isLoading, redirected]);

  if (isLoading || (session && !redirected)) {
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
          {/* Logo Section */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
              <Image
                src="/AIDOlogo.svg"
                alt="AIDO Logo"
                width={80}
                height={80}
                className="rounded-lg"
                priority
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              AIDO
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-md">
              Advanced Interactive Dashboard Organizer
            </p>
          </div>

          {/* Hero Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Organize Your Tasks Efficiently
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              AIDO is a comprehensive todo application with CRUD operations, priority management, and secure authentication. Manage your tasks with ease and focus on what matters most.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white">Task Management</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Create, read, update, and delete tasks</p>
              </div>
              <div className="bg-green-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white">Priority Levels</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Critical, high, medium, low priorities</p>
              </div>
              <div className="bg-purple-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white">Secure Auth</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Email verification & secure login</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/login"
                className="flex h-12 w-full items-center justify-center rounded-full bg-indigo-600 px-6 text-white font-medium transition-colors hover:bg-indigo-700 md:w-auto"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="flex h-12 w-full items-center justify-center rounded-full border border-indigo-600 px-6 text-indigo-600 font-medium transition-colors hover:bg-indigo-50 dark:hover:bg-gray-700 dark:text-indigo-400 dark:border-indigo-400 md:w-auto"
              >
                Register
              </Link>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>© {new Date().getFullYear()} AIDO - Advanced Interactive Dashboard Organizer</p>
          </div>
        </div>
      </main>
    </div>
  );
}
