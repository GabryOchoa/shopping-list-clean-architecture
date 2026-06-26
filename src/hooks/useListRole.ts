import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { ListRole } from '../types';

export function useListRole(
  listId: string,
  ownerId: string,
): { role: ListRole | null; loading: boolean } {
  const { user } = useAuth();
  const [role, setRole] = useState<ListRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchRole() {
      try {
        if (!user || cancelled) return;

        if (user.id === ownerId) {
          setRole('owner');
          return;
        }

        const { data } = await supabase
          .from('list_members')
          .select('role')
          .eq('list_id', listId)
          .eq('user_id', user.id)
          .single();

        if (!cancelled) {
          setRole(data?.role ?? null);
        }
      } catch {
        if (!cancelled) setRole(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchRole();

    return () => {
      cancelled = true;
    };
  }, [listId, ownerId, user]);

  return { role, loading };
}
