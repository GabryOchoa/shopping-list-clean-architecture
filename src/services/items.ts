import { supabase } from "./supabase";
import { Item } from "../types";

export async function fetchItems(listId: string): Promise<Item[]> {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("list_id", listId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data as Item[];
}

export async function createItem(
  listId: string,
  name: string,
  quantity: number = 1,
): Promise<Item> {
  const { data, error } = await supabase
    .from("items")
    .insert({
      list_id: listId,
      name: name.trim(),
      quantity,
      is_checked: false,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Item;
}

export async function updateItem(
  id: string,
  updates: Partial<Pick<Item, "name" | "quantity" | "is_checked">>,
): Promise<Item> {
  const { data, error } = await supabase
    .from("items")
    .update({
      ...updates,
      name: updates.name?.trim(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Item;
}

// ─── Toggle checked ──────
// Separate function because toggling is a very frequent
// interaction — deserves its own clear method

export async function toggleItem(
  id: string,
  isChecked: boolean,
): Promise<Item> {
  return updateItem(id, { is_checked: isChecked });
}

export async function deleteItem(id: string): Promise<void> {
  const { error } = await supabase.from("items").delete().eq("id", id);

  if (error) throw new Error(error.message);
}
