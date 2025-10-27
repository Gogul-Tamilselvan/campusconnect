'use client';
import { useState, useEffect } from 'react';
import { onSnapshot, Query, DocumentData, QuerySnapshot } from 'firebase/firestore';

interface UseCollectionOptions {
  listen?: boolean;
}

export const useCollection = <T extends DocumentData>(
  query: Query<DocumentData> | null,
  options: UseCollectionOptions = { listen: true }
) => {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    const handleSnapshot = (snapshot: QuerySnapshot<DocumentData>) => {
      const result: T[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as T));
      setData(result);
      setLoading(false);
    };

    const handleError = (err: Error) => {
      setError(err);
      setLoading(false);
      console.error(err);
    };

    const unsubscribe = onSnapshot(query, handleSnapshot, handleError);
    
    return () => unsubscribe();
  }, [query, options.listen]);

  return { data, loading, error };
};
