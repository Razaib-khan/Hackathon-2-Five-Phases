/**
 * Auth Context - Stub for Phase 2
 */

'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

export interface User {
  id: string
  email: string
  name?: string
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false)

  const value: AuthContextType = {
    user: null,
    loading,
    isLoading: loading,
    login: async () => {
      setLoading(true)
      try {
        // Stub: will be implemented in Phase 3
      } finally {
        setLoading(false)
      }
    },
    signup: async () => {
      setLoading(true)
      try {
        // Stub: will be implemented in Phase 3
      } finally {
        setLoading(false)
      }
    },
    register: async () => {
      setLoading(true)
      try {
        // Stub: will be implemented in Phase 3
      } finally {
        setLoading(false)
      }
    },
    logout: async () => {
      setLoading(true)
      try {
        // Stub: will be implemented in Phase 3
      } finally {
        setLoading(false)
      }
    },
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    return {
      user: null,
      loading: false,
      isLoading: false,
      login: async () => {},
      signup: async () => {},
      register: async () => {},
      logout: async () => {},
    }
  }
  return context
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage?.getItem('authToken') || null
}

export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage?.setItem('authToken', token)
  }
}

export function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage?.removeItem('authToken')
  }
}
