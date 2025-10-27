'use client';

import { useState, useMemo, useEffect } from 'react';
import { AuthContext } from '@/hooks/use-auth';
import type { User, UserRole } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { MOCK_USERS } from '@/lib/mock-data';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for a logged-in user
    setLoading(false);
  }, []);

  const login = (username: string, password?: string) => {
    const foundUser = MOCK_USERS.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (foundUser && (!password || foundUser.password === password)) {
        setUser(foundUser);
    } else {
        throw new Error('Invalid username or password.');
    }
  };

  const logout = () => {
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout,
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
