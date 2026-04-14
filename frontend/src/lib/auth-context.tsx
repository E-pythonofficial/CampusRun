import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from './types';
import api from './api'; 

type Theme = 'dark' | 'light';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  theme: Theme;
  toggleTheme: () => void;
  login: (email: string, password: string) => Promise<User>;
  // dispatcherlogin: (id: string, password: string) => Promise<User>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateUserProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('campusrun_theme');
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('campusrun_session');
    const token = localStorage.getItem('campusrun_token');

    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        logout();
      }
    }

    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('campusrun_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const data = response.data;

      const rawUser = data.user || data; 

      const loggedInUser: User = {
        ...rawUser,
        isVerified: !!rawUser.isVerified, 
        isApproved: !!rawUser.isApproved,
        fullName: rawUser.fullName || rawUser.fullname || 'User'
      };

      setUser(loggedInUser);
      if (data.token) localStorage.setItem('campusrun_token', data.token);
      localStorage.setItem('campusrun_session', JSON.stringify(loggedInUser));

      return loggedInUser;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed';
      const error = new Error(message);
      (error as any).status = err.response?.status;
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('campusrun_session');
    localStorage.removeItem('campusrun_token');
  };

  const switchRole = (role: UserRole) => {
    if (!user) return;
    const updatedUser: User = { ...user, role };
    setUser(updatedUser);
    localStorage.setItem('campusrun_session', JSON.stringify(updatedUser));
  };

  const updateUserProfile = (updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updatedUser = { ...prev, ...updates };
      localStorage.setItem('campusrun_session', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, theme, toggleTheme, login,  logout, switchRole, updateUserProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};