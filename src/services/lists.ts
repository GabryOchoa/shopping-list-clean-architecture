import { supabase } from "./supabase";
import { List } from "../types";

// Fetch lists owned by the current user, ordered by creation date (newest first)
export async function fetchLists(): Promise<List[]> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("lists")
    .select("*")
    .eq("owner_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as List[];
}

export type SharedListEntry = {
  list: List;
  role: "viewer" | "editor";
};

// Fetch lists shared with the current user via list_members
export async function fetchSharedLists(): Promise<SharedListEntry[]> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("list_members")
    .select("role, list:lists(*)")
    .eq("user_id", session.user.id)
    .order("joined_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data as unknown as { role: "viewer" | "editor"; list: List }[]).map(
    (entry) => ({
      list: entry.list,
      role: entry.role,
    }),
  );
}

// Create a new list with the given name and optional description, associating it with the authenticated user
export async function createList(
  name: string,
  description?: string,
): Promise<List> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("lists")
    .insert({
      name: name.trim(),
      description: description?.trim() ?? null,
      owner_id: session.user.id,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as List;
}

// Update an existing list's name and/or description by its ID
export async function updateList(
  id: string,
  updates: Partial<Pick<List, "name" | "description">>,
): Promise<List> {
  const { data, error } = await supabase
    .from("lists")
    .update({
      ...updates,
      name: updates.name?.trim(),
      description: updates.description?.trim() ?? null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as List;
}

// Delete a list by its ID
export async function deleteList(id: string): Promise<void> {
  const { error } = await supabase.from("lists").delete().eq("id", id);

  if (error) throw new Error(error.message);
}
