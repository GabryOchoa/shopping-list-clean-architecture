import { supabase } from './supabase';
import { List } from '../types';

// Fetch lists owned by a user, ordered by creation date (newest first)
export async function fetchLists(userId: string): Promise<List[]> {
  const { data, error } = await supabase
    .from('lists')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as List[];
}

export type SharedListEntry = {
  list: List;
  role: 'viewer' | 'editor';
};

// Fetch lists shared with a user via list_members
export async function fetchSharedLists(
  userId: string,
): Promise<SharedListEntry[]> {
  const { data, error } = await supabase
    .from('list_members')
    .select('role, list:lists(*)')
    .eq('user_id', userId)
    .order('joined_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (data as unknown as { role: 'viewer' | 'editor'; list: List }[]).map(
    (entry) => ({
      list: entry.list,
      role: entry.role,
    }),
  );
}

// Create a new list with the given name and optional description, associating it with a user
export async function createList(
  userId: string,
  name: string,
  description?: string,
): Promise<List> {
  const { data, error } = await supabase
    .from('lists')
    .insert({
      name: name.trim(),
      description: description?.trim() ?? null,
      owner_id: userId,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as List;
}

// Update an existing list's name and/or description by its ID
export async function updateList(
  id: string,
  updates: Partial<Pick<List, 'name' | 'description'>>,
): Promise<List> {
  const { data, error } = await supabase
    .from('lists')
    .update({
      ...updates,
      name: updates.name?.trim(),
      description: updates.description?.trim() ?? null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as List;
}

// Delete a list by its ID
export async function deleteList(id: string): Promise<void> {
  const { error } = await supabase.from('lists').delete().eq('id', id);

  if (error) throw new Error(error.message);
}
