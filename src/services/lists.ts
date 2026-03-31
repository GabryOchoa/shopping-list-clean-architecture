import { supabase } from "./supabase";
import { List } from "../types";

// Fetch all lists from the database, ordered by creation date (newest first)
export async function fetchLists(): Promise<List[]> {
  const { data, error } = await supabase
    .from("lists")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as List[];
}

// Create a new list with the given name and optional description, associating it with the authenticated user
export async function createList(
  name: string,
  description?: string,
): Promise<List> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("lists")
    .insert({
      name: name.trim(),
      description: description?.trim() ?? null,
      owner_id: user.id,
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
