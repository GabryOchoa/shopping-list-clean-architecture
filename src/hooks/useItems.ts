import { useState, useEffect, useCallback } from 'react';
import { Item } from '../types';
import {
  fetchItems,
  createItem,
  updateItem,
  toggleItem,
  deleteItem,
} from '../services/items';
import { mapError } from '../utils/mapError';

type UseItemsReturn = {
  items: Item[];
  loading: boolean;
  error: string | null;
  clearError: () => void;
  refresh: () => Promise<void>;
  addItem: (name: string, quantity?: number) => Promise<void>;
  editItem: (id: string, name: string, quantity: number) => Promise<void>;
  checkItem: (id: string, isChecked: boolean) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
};

export function useItems(listId: string): UseItemsReturn {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchItems(listId);
      setItems(data);
    } catch (e: any) {
      setError(mapError(e));
    } finally {
      setLoading(false);
    }
  }, [listId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(
    async (name: string, quantity: number = 1) => {
      const newItem = await createItem(listId, name, quantity);
      setItems((prev) => [...prev, newItem]);
    },
    [listId],
  );

  const editItem = useCallback(
    async (id: string, name: string, quantity: number) => {
      const updated = await updateItem(id, { name, quantity });
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
    },
    [],
  );

  // Optimistic toggle — update UI instantly, sync in background

  const checkItem = useCallback(async (id: string, isChecked: boolean) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, is_checked: isChecked } : i)),
    );
    try {
      await toggleItem(id, isChecked);
    } catch {
      // Revert on failure
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, is_checked: !isChecked } : i)),
      );
    }
  }, []);

  // Remove an item with optimistic rollback on failure
  const removeItem = useCallback(
    async (id: string) => {
      const previous = items;
      setItems((prev) => prev.filter((i) => i.id !== id));
      try {
        await deleteItem(id);
      } catch (e: any) {
        setItems(previous);
        setError(mapError(e));
      }
    },
    [items],
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    items,
    loading,
    error,
    clearError,
    refresh,
    addItem,
    editItem,
    checkItem,
    removeItem,
  };
}
