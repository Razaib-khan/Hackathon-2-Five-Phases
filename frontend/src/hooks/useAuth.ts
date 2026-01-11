import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface Session {
  accessToken: string;
  user: User;
}

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for session in localStorage
    const sessionData = localStorage.getItem('better-auth.session_token');

    if (sessionData) {
      try {
        const parsedSession = JSON.parse(sessionData);
        setSession(parsedSession);
      } catch (error) {
        console.error('Error parsing session data:', error);
        localStorage.removeItem('better-auth.session_token');
      }
    }

    setIsLoading(false);
  }, []);

  const login = (sessionData: Session) => {
    localStorage.setItem('better-auth.session_token', JSON.stringify(sessionData));
    setSession(sessionData);
  };

  const logout = () => {
    localStorage.removeItem('better-auth.session_token');
    setSession(null);
  };

  return {
    session,
    isLoading,
    login,
    logout,
  };
};