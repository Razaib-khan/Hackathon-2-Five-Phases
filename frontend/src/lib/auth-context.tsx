'use client';

/**
 * Authentication Context Provider
 *
 * Provides:
 * - Current user state
 * - Login/logout/register functions
 * - Authentication status
 * - Auto-redirect on auth state change
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/types';
import {
  getStoredUser,
  getToken,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
} from './api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check for existing session on mount
  useEffect(() => {
    const token = getToken();
    const storedUser = getStoredUser();

    if (token && storedUser) {
      setUser(storedUser);
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiLogin(email, password);
    setUser(response.user);
    router.push('/tasks');
  };

  const register = async (email: string, password: string) => {
    const response = await apiRegister(email, password);
    setUser(response.user);
    router.push('/tasks');
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
