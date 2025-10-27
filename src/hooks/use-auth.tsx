'use client';

import type { User } from '@/lib/types';
import { createContext, useContext } from 'react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password?: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
