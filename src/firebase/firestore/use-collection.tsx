'use client';
import { useState, useEffect, useCallback } from 'react';
import { onSnapshot, Query, DocumentData, QuerySnapshot, getDocs } from 'firebase/firestore';

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

  const fetchData = useCallback(async () => {
    if (!query) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const snapshot = await getDocs(query);
      const result: T[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as T));
      setData(result);
    } catch (err) {
      setError(err as Error);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    if (options.listen) {
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
    } else {
      fetchData();
    }
  }, [query, options.listen, fetchData]);

  const refetch = () => {
     if (!options.listen) {
       fetchData();
     }
     // For listeners, data is refetched automatically.
     // We can add a manual getDocs for listeners too if a forced instant refetch is needed.
  }

  return { data, loading, error, refetch };
};