'use client';
import { useState, useEffect } from 'react';
import { onSnapshot, doc, DocumentData, DocumentReference } from 'firebase/firestore';

interface UseDocOptions {
  listen?: boolean;
}

export const useDoc = <T extends DocumentData>(
  ref: DocumentReference<DocumentData> | null,
  options: UseDocOptions = { listen: true }
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!ref) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(ref, 
      (doc) => {
        if (doc.exists()) {
          setData({ id: doc.id, ...doc.data() } as T);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
        console.error(err);
      }
    );

    return () => unsubscribe();
  }, [ref, options.listen]);

  return { data, loading, error };
};
