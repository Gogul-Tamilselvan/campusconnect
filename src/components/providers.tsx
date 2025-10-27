'use client';

import { AuthProvider } from '@/components/auth-provider';
import { FirebaseProvider } from '@/firebase/provider';
import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      console.error(error); // This will show the detailed error in the browser console
      // And we can show a toast to the user
      toast({
        variant: 'destructive',
        title: 'Permission Error',
        description: 'You do not have permission to perform this action. Check the console for details.',
      });
    };

    errorEmitter.on('permission-error', handleError);

    // No direct off method in our simple emitter, so we rely on component unmount
    // In a real app, you would have a way to remove the listener.
  }, [toast]);

  return null;
}


export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseProvider>
      <AuthProvider>
        {children}
        <FirebaseErrorListener />
      </AuthProvider>
    </FirebaseProvider>
  );
}
