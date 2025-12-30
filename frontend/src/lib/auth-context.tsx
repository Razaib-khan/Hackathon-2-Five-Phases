/**
 * Auth Context - Stub for Phase 2
 */

'use client'

import React, { createContext, useContext } from 'react'

export interface User {
  id: string
  email: string
  name?: string
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value: AuthContextType = {
    user: null,
    loading: false,
    login: async () => {},
    signup: async () => {},
    logout: async () => {},
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
      login: async () => {},
      signup: async () => {},
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
