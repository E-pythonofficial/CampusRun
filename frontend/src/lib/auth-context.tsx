import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from './types';
import { mockUser } from './mock-data';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<UserRole>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateUserProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('campusrun_session');

    if (savedUser) {
      try {
        const parsedUser: User = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch {
        localStorage.removeItem('campusrun_session');
      }
    }
  }, []);

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