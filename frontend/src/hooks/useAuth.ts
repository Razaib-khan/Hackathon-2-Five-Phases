import { useState, useEffect, createContext, useContext } from 'react';
import { User, Token } from '../lib/types';
import { apiService } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  register: (userData: { email: string; username: string; password: string; gdpr_consent: boolean }) => Promise<void>;
  logout: () => void;
  updateUser: (profileData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (storedToken) {
      apiService.setToken(storedToken);
      // Try to fetch user profile to validate token
      apiService.getProfile()
        .then(fetchedUser => {
          setUser(fetchedUser);
          setToken(storedToken);
        })
        .catch(() => {
          // If token is invalid, clear it
          localStorage.removeItem('token');
          apiService.removeToken();
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    try {
      const response = await apiService.login(credentials);
      const { access_token, user: userData } = response;

      // Store token and update context
      apiService.setToken(access_token);
      setToken(access_token);
      setUser(userData);
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: { email: string; username: string; password: string; gdpr_consent: boolean }) => {
    try {
      const response = await apiService.register(userData);
      const { access_token, user: newUser } = response;

      // Store token and update context
      apiService.setToken(access_token);
      setToken(access_token);
      setUser(newUser);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    // Clear token from localStorage and service
    localStorage.removeItem('token');
    apiService.removeToken();

    // Reset state
    setUser(null);
    setToken(null);
  };

  const updateUser = async (profileData: any) => {
    try {
      const updatedUser = await apiService.updateProfile(profileData);
      setUser(updatedUser);
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};