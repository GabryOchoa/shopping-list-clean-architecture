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

type UseListReturn = {
  lists: List[];
  sharedEntries: SharedListEntry[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addList: (name: string, description?: string) => Promise<void>;
  editList: (id: string, name: string, description?: string) => Promise<void>;
  removeList: (id: string) => Promise<void>;
};

export function useLists(): UseListReturn {
  const [lists, setLists] = useState<List[]>([]);
  const [sharedEntries, setSharedEntries] = useState<SharedListEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [owned, shared] = await Promise.all([
        fetchLists(),
        fetchSharedLists(),
      ]);
      setLists(owned);
      setSharedEntries(shared);
    } catch (e: any) {
      setError(e.message ?? 'Failed to fetch lists');
    } finally {
      setLoading(false);
    }
  }, []);

  //load lists on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Add a new list and update state
  const addList = useCallback(async (name: string, description?: string) => {
    const newList = await createList(name, description);
    // Optimistically prepend so UI feels instant
    setLists((prev) => [newList, ...prev]);
  }, []);

  // Edit an existing list and update state
  const editList = useCallback(
    async (id: string, name: string, description?: string) => {
      const updated = await updateList(id, { name, description });
      setLists((prev) => prev.map((l) => (l.id === id ? updated : l)));
    },
    [],
  );

  // Remove a list and update state
  const removeList = useCallback(async (id: string) => {
    await deleteList(id);
    // Remove from local state immediately
    setLists((prev) => prev.filter((l) => l.id !== id));
  }, []);

  return {
    lists,
    sharedEntries,
    loading,
    error,
    refresh,
    addList,
    editList,
    removeList,
  };
}
