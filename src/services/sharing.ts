import { supabase } from "./supabase";
import { ListMember, Profile } from "../types";

// ─── Fetch members of a list ─────────────────────────────

export type MemberWithProfile = ListMember & {
  profile: Pick<Profile, "id" | "email" | "display_name" | "avatar_url">;
};

export async function fetchMembers(
  listId: string,
): Promise<MemberWithProfile[]> {
  const { data, error } = await supabase
    .from("list_members")
    .select(
      `
      *,
      profile:profiles (
        id,
        email,
        display_name,
        avatar_url
      )
    `,
    )
    .eq("list_id", listId)
    .order("joined_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data as MemberWithProfile[];
}

// ────── Look up a user by email before inviting ────────────
// We never expose user IDs in the UI — always look up by email

export async function findUserByEmail(email: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email.toLowerCase().trim())
    .single();

  if (error?.code === "PGRST116") return null; // not found
  if (error) throw new Error(error.message);
  return data as Profile;
}

// ────── Invite a user to a list ────────────

export async function inviteMember(
  listId: string,
  userId: string,
  role: "viewer" | "editor" = "viewer",
): Promise<ListMember> {
  const { data, error } = await supabase
    .from("list_members")
    .insert({
      list_id: listId,
      user_id: userId,
      role,
    })
    .select()
    .single();

  if (error?.code === "23505")
    throw new Error("This user is already a member of this list");
  if (error) throw new Error(error.message);
  return data as ListMember;
}

// ─── Update a member's role ───────────────────────────────

export async function updateMemberRole(
  memberId: string,
  role: "viewer" | "editor",
): Promise<ListMember> {
  const { data, error } = await supabase
    .from("list_members")
    .update({ role })
    .eq("id", memberId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as ListMember;
}

// ─── Remove a member from a list ─────────────────────────

export async function removeMember(memberId: string): Promise<void> {
  const { error } = await supabase
    .from("list_members")
    .delete()
    .eq("id", memberId);

  if (error) throw new Error(error.message);
}
