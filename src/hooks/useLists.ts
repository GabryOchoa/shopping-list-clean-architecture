import { useState, useEffect, useCallback } from 'react';
import { List } from '../types';
import {
  fetchLists,
  fetchSharedLists,
  SharedListEntry,
  createList,
  updateList,
  deleteList,
} from '../services/lists';
import { useAuth } from '../context/AuthContext';
import { mapError } from '../utils/mapError';

type UseListReturn = {
  lists: List[];
  sharedEntries: SharedListEntry[];
  loading: boolean;
  error: string | null;
  clearError: () => void;
  refresh: () => Promise<void>;
  addList: (name: string, description?: string) => Promise<void>;
  editList: (id: string, name: string, description?: string) => Promise<void>;
  removeList: (id: string) => Promise<void>;
};

export function useLists(): UseListReturn {
  const { user } = useAuth();
  const [lists, setLists] = useState<List[]>([]);
  const [sharedEntries, setSharedEntries] = useState<SharedListEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const [owned, shared] = await Promise.all([
        fetchLists(user.id),
        fetchSharedLists(user.id),
      ]);
      setLists(owned);
      setSharedEntries(shared);
    } catch (e: any) {
      setError(mapError(e));
    } finally {
      setLoading(false);
    }
  }, [user]);

  //load lists on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Add a new list and update state
  const addList = useCallback(
    async (name: string, description?: string) => {
      if (!user) throw new Error('User not authenticated');
      const newList = await createList(user.id, name, description);
      // Optimistically prepend so UI feels instant
      setLists((prev) => [newList, ...prev]);
    },
    [user],
  );

  // Edit an existing list and update state
  const editList = useCallback(
    async (id: string, name: string, description?: string) => {
      const updated = await updateList(id, { name, description });
      setLists((prev) => prev.map((l) => (l.id === id ? updated : l)));
    },
    [],
  );

  // Remove a list with optimistic rollback on failure
  const removeList = useCallback(
    async (id: string) => {
      const previous = lists;
      setLists((prev) => prev.filter((l) => l.id !== id));
      try {
        await deleteList(id);
      } catch (e: any) {
        setLists(previous);
        setError(mapError(e));
      }
    },
    [lists],
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    lists,
    sharedEntries,
    loading,
    error,
    clearError,
    refresh,
    addList,
    editList,
    removeList,
  };
}
