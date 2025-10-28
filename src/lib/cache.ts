import { Query, collection, query, where, orderBy, limit, startAt, startAfter, endAt, endBefore } from 'firebase/firestore';

const cache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function getQueryKey(q: Query): string {
    // This is a simplified key generator. A more robust solution might serialize the query constraints.
    return (q as any)._query.path.segments.join('/') + JSON.stringify((q as any)._query.filters) + JSON.stringify((q as any)._query.orderBy);
}

export function getCache<T>(key: string): T | null {
    const entry = cache.get(key);
    if (entry && (Date.now() - entry.timestamp) < CACHE_TTL) {
        return entry.data as T;
    }
    // Cache expired or not found
    if (entry) {
        cache.delete(key);
    }
    return null;
}

export function setCache<T>(key: string, data: T) {
    cache.set(key, { data, timestamp: Date.now() });
}

export function clearCache(key: string) {
    cache.delete(key);
}

export function clearAllCache() {
    cache.clear();
}
