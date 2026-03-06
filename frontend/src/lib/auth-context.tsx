import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from './types';
import { mockUser } from './mock-data';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  // Updated to accept credentials and return a promise of the role
  login: (matricNumber: string, password: string) => Promise<UserRole>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (matricNumber: string, password: string): Promise<UserRole> => {
    // For now, simulating an API call. 
    // In production, you'll fetch the user and role from MongoDB via Express.
    return new Promise((resolve) => {
      setTimeout(() => {
        const role: UserRole = 'requester'; // Defaulting to requester for demo
        setUser({ ...mockUser, role });
        resolve(role);
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (role: UserRole) => {
    if (user) setUser({ ...user, role });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};