/**
 * Auth Context - User Authentication Management
 */

'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import * as api from './api'

export interface User {
  id: string
  email: string
  name?: string
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const response = await api.login(email, password)
      if (response.user?.id) {
        setUser({ id: response.user.id, email: response.user.email || email })
      }
      router.push('/tasks')
    } finally {
      setLoading(false)
    }
  }

  const signup = async (email: string, password: string) => {
    setLoading(true)
    try {
      const response = await api.signup(email, password)
      if (response.user?.id) {
        setUser({ id: response.user.id, email: response.user.email || email })
      }
      router.push('/tasks')
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string) => {
    setLoading(true)
    try {
      const response = await api.register(email, password)
      if (response.user?.id) {
        setUser({ id: response.user.id, email: response.user.email || email })
      }
      router.push('/tasks')
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await api.logout()
      setUser(null)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    isLoading: loading,
    isAuthenticated: user !== null,
    login,
    signup,
    register,
    logout,
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
      isAuthenticated: false,
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
