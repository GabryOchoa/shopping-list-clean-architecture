import { useState, useEffect, useCallback } from "react";
import {
  fetchMembers,
  findUserByEmail,
  inviteMember,
  updateMemberRole,
  removeMember,
  MemberWithProfile,
} from "../services/sharing";

type UseShareListReturn = {
  members: MemberWithProfile[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  inviteByEmail: (email: string, role: "viewer" | "editor") => Promise<void>;
  changeRole: (memberId: string, role: "viewer" | "editor") => Promise<void>;
  kickMember: (memberId: string) => Promise<void>;
};

export function useShareList(listId: string): UseShareListReturn {
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchMembers(listId);
      setMembers(data);
    } catch (e: any) {
      setError(e.message ?? "Failed to load members");
    } finally {
      setLoading(false);
    }
  }, [listId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Look up user by email first, then invite
  // Separating lookup from invite keeps error messages clear:
  // "User not found" vs "Already a member" are very different errors
  const inviteByEmail = useCallback(
    async (email: string, role: "viewer" | "editor") => {
      const user = await findUserByEmail(email);
      if (!user) throw new Error("No account found with that email address");

      await inviteMember(listId, user.id, role);

      // Refresh to get the full member + profile join
      await refresh();
    },
    [listId, refresh],
  );

  const changeRole = useCallback(
    async (memberId: string, role: "viewer" | "editor") => {
      const updated = await updateMemberRole(memberId, role);
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: updated.role } : m)),
      );
    },
    [],
  );

  const kickMember = useCallback(async (memberId: string) => {
    await removeMember(memberId);
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
  }, []);

  return {
    members,
    loading,
    error,
    refresh,
    inviteByEmail,
    changeRole,
    kickMember,
  };
}
