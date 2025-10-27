'use client';

import { useState, useMemo } from 'react';
import { AuthContext } from '@/hooks/use-auth';
import type { User, UserRole } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const MOCK_USERS: Record<UserRole, User> = {
  Admin: { name: 'Admin User', role: 'Admin', avatarUrl: PlaceHolderImages.find(img => img.id === 'avatar-1')?.imageUrl || '' },
  Teacher: { name: 'Teacher User', role: 'Teacher', avatarUrl: PlaceHolderImages.find(img => img.id === 'avatar-2')?.imageUrl || '' },
  Student: { name: 'Student User', role: 'Student', avatarUrl: PlaceHolderImages.find(img => img.id === 'avatar-3')?.imageUrl || '' },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: UserRole) => {
    setUser(MOCK_USERS[role]);
  };

  const logout = () => {
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    login,
    logout,
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
