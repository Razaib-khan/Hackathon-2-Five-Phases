'use client';

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      // Check if user is authenticated
      if (isAuthenticated) {
        // Redirect to tasks page if authenticated
        router.push('/tasks')
      } else {
        // Redirect to login if not authenticated
        router.push('/login')
      }
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    )
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
