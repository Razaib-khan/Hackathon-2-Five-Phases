'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getToken } from '@/lib/api'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check if user has a token stored
    const token = getToken()
    if (token) {
      // Redirect to dashboard if authenticated
      router.push('/dashboard')
    } else {
      // Redirect to login if not authenticated
      router.push('/login')
    }
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" />
    </div>
  )
}