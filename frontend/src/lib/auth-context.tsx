import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from './types';
import { mockUser } from './mock-data';

// Define the theme type
type Theme = 'dark' | 'light';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  theme: Theme;
  toggleTheme: () => void;
  login: (email: string, password: string) => Promise<UserRole>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateUserProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  
  // 1. Initialize theme: Check localStorage first, then fallback to System Preference
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('campusrun_theme');
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;

    // Sniff system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // 2. Effect to handle session, theme application, and System Sync
  useEffect(() => {
    // --- Session Management ---
    const savedUser = localStorage.getItem('campusrun_session');
    if (savedUser) {
      try {
        const parsedUser: User = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch {
        localStorage.removeItem('campusrun_session');
      }
    }

    // --- Theme Application ---
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('campusrun_theme', theme);

    // --- System Theme Listener ---
    // If the user hasn't manually set a theme, this ensures the app follows their OS changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if the user hasn't saved a specific preference in this session
      const hasManualPreference = localStorage.getItem('campusrun_theme_manual');
      if (!hasManualPreference) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === 'dark' ? 'light' : 'dark';
      // Mark that the user has made a manual choice
      localStorage.setItem('campusrun_theme_manual', 'true');
      return newTheme;
    });
  };

  const login = async (email: string, password: string): Promise<UserRole> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const role: UserRole = 'requester';

        const loggedInUser: User = {
          ...mockUser,
          role,
          email: email,
          fullName: mockUser.fullName ?? "Eniola Oluwaseyifunmi",
          username: mockUser.username ?? "enny_sax123",
          matricNumber: mockUser.matricNumber ?? "CSC/2021/001"
        };

        setUser(loggedInUser);
        localStorage.setItem('campusrun_session', JSON.stringify(loggedInUser));

        resolve(role);
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('campusrun_session');
    // We keep the theme preference even after logout for a better UX
    
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('activeRun_')) {
        localStorage.removeItem(key);
      }
    });
  };

  const switchRole = (role: UserRole) => {
    if (!user) return;

    const updatedUser: User = {
      ...user,
      role
    };

    setUser(updatedUser);
    localStorage.setItem('campusrun_session', JSON.stringify(updatedUser));
  };

  const updateUserProfile = (updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;

      const updatedUser = {
        ...prev,
        ...updates
      };

      localStorage.setItem('campusrun_session', JSON.stringify(updatedUser));

      return updatedUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        theme,
        toggleTheme,
        login,
        logout,
        switchRole,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};