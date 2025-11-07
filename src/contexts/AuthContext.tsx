import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { safeParseLocalStorage, localStorageValidators } from '@/lib/utils';
import { apiClient } from '@/lib/apiClient';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'TVET' | 'ADOF' | 'ADMIN';
  interested_field?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  sessionStart: Date | null;
  lastActivity: Date | null;
  updateActivity: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStart, setSessionStart] = useState<Date | null>(null);
  const [lastActivity, setLastActivity] = useState<Date | null>(null);

  useEffect(() => {
    // Check for stored auth data on app load
    const user = safeParseLocalStorage('auth_user', localStorageValidators.user);
    if (user) {
      setUser(user);
      // Restore session timestamps
      const storedSessionStart = localStorage.getItem('session_start');
      const storedLastActivity = localStorage.getItem('last_activity');
      if (storedSessionStart) {
        const date = new Date(storedSessionStart);
        if (!isNaN(date.getTime())) {
          setSessionStart(date);
        }
      }
      if (storedLastActivity) {
        const date = new Date(storedLastActivity);
        if (!isNaN(date.getTime())) {
          setLastActivity(date);
        }
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    // Load interested_field from localStorage if available
    const interestedField = localStorage.getItem('interested_field');
    const userWithInterests = interestedField ? { ...userData, interested_field: interestedField } : userData;
    
    setUser(userWithInterests);
    const now = new Date();
    setSessionStart(now);
    setLastActivity(now);
    
    localStorage.setItem('auth_user', JSON.stringify(userWithInterests));
    localStorage.setItem('session_start', now.toISOString());
    localStorage.setItem('last_activity', now.toISOString());
    
    // Prefetch critical admin data in the background (non-blocking)
    if (userData.role === 'ADMIN') {
      apiClient.prefetchAdminData().catch(error => {
        console.error('Background prefetch after login failed:', error);
      });
    }
  };

  const logout = () => {
    setUser(null);
    setSessionStart(null);
    setLastActivity(null);
    
    localStorage.removeItem('auth_user');
    localStorage.removeItem('session_start');
    localStorage.removeItem('last_activity');
    localStorage.removeItem('interested_field');
    localStorage.removeItem('recommended_courses');
    localStorage.removeItem('recommended_courses_timestamp');
  };

  const updateActivity = () => {
    const now = new Date();
    setLastActivity(now);
    localStorage.setItem('last_activity', now.toISOString());
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    sessionStart,
    lastActivity,
    updateActivity,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};