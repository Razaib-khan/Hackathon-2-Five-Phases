import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User } from '../lib/types';
import { apiService } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  api: typeof import('../lib/api').apiService;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  register: (userData: {
    email: string;
    username: string;
    password: string;
    password_confirmation: string;
    first_name: string;
    last_name: string;
    gdpr_consent: boolean
  }) => Promise<void>;
  logout: () => void;
  updateUser: (profileData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
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

  const register = async (userData: {
    email: string;
    username: string;
    password: string;
    password_confirmation: string;
    first_name: string;
    last_name: string;
    gdpr_consent: boolean
  }) => {
    try {
      const response = await apiService.register(userData);

      // Handle different possible response structures from backend
      let token: string;
      let newUser: User;

      if (response && typeof response === 'object' && 'access_token' in response && 'user' in response) {
        // Standard response format
        const typedResponse = response as { access_token: string; user: User };
        token = typedResponse.access_token;
        newUser = typedResponse.user;
      } else if (response && typeof response === 'object' && 'token' in response && 'user' in response) {
        // Alternative format with 'token' field
        const typedResponse = response as { token: string; user: User };
        token = typedResponse.token;
        newUser = typedResponse.user;
      } else {
        // If response structure is unknown, try to get user profile
        const profile = await apiService.getProfile();
        setUser(profile);
        return;
      }

      // Store token and update context
      apiService.setToken(token);
      setToken(token);
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
    api: apiService,
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