'use client';

import { createAuthClient } from 'better-auth/react';
import * as React from 'react';
import { createContext, useContext, ReactNode } from 'react';

// Initialize the Better Auth client
const authClient = createAuthClient({
  baseURL: 'http://localhost:8000',
  fetchOptions: {},
});

// Define types
interface User {
  id: string;
  email?: string;
  name: string;
}

type Session = any;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<any>;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, isPending: isLoading, refetch: mutate } = authClient.useSession();

  const signIn = async (email: string, password: string) => {
    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result && !result.error) {
        mutate();
        return result.data;
      } else {
        throw new Error(result?.error?.message || 'Sign in failed');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const name = `${firstName} ${lastName}`;
      const result = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (result && !result.error) {
        mutate();
        return result.data;
      } else {
        throw new Error(result?.error?.message || 'Sign up failed');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const result = await authClient.signOut();
      if (result && !result.error) {
        mutate();
      } else {
        throw new Error(result?.error?.message || 'Sign out failed');
      }
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const authValue: AuthContextType = {
    user: session?.user || null,
    session: session || null,
    signIn,
    signUp,
    signOut,
    isLoading
  };

  // Using React.createElement to avoid JSX parsing issues
  return React.createElement(
    AuthContext.Provider,
    { value: authValue },
    children
  );
};

function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const useAuth = () => {
  return useAuthContext();
};

export { authClient };