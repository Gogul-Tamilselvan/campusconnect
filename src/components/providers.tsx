'use client';

import { AuthProvider } from '@/components/auth-provider';
import { FirebaseProvider } from '@/firebase/provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseProvider>
      <AuthProvider>{children}</AuthProvider>
    </FirebaseProvider>
  );
}
