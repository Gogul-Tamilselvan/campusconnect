'use client';
import { useState, useEffect, useCallback } from 'react';
import { onSnapshot, Query, DocumentData, QuerySnapshot, getDocs, getDocsFromCache } from 'firebase/firestore';
import { clearCache, getCache, setCache, getQueryKey } from '@/lib/cache';

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
  const queryKey = query ? getQueryKey(query) : null;

  const fetchData = useCallback(async (force = false) => {
    if (!query || !queryKey) {
      setData([]);
      setLoading(false);
      return;
    }

    if (!force) {
        const cachedData = getCache<T[]>(queryKey);
        if (cachedData) {
            setData(cachedData);
            setLoading(false);
            return;
        }
    }

    setLoading(true);
    try {
      const snapshot = await getDocs(query);
      const result: T[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as T));
      setData(result);
      setCache(queryKey, result);
    } catch (err) {
      setError(err as Error);
      console.error(`Error fetching collection ${queryKey}:`, err);
    } finally {
      setLoading(false);
    }
  }, [query, queryKey]);

  useEffect(() => {
    if (!query) {
      setData([]);
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
        setError(null);
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

  const refetch = useCallback(() => {
     if (queryKey) {
        clearCache(queryKey);
        fetchData(true);
     }
  }, [queryKey, fetchData])

  return { data, loading, error, refetch };
};
