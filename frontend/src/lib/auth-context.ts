/**
 * Auth Context Utilities
 *
 * Provides authentication state management and utilities for the frontend.
 * Currently stubbed for static export. Will be fully implemented in Phase 3.
 */

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

// Stub implementation for static export
export const defaultAuthContext: AuthContextType = {
  user: null,
  loading: false,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
}

export function useAuth(): AuthContextType {
  // Returns stub context for Phase 2
  // Will be replaced with actual context implementation in Phase 3
  return defaultAuthContext
}

export function getAuthToken(): string | null {
  // Stub implementation
  return null
}

export function setAuthToken(token: string): void {
  // Stub implementation
}

export function clearAuthToken(): void {
  // Stub implementation
}
