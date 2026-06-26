import {
  fetchMembers,
  findUserByEmail,
  inviteMember,
  updateMemberRole,
  removeMember,
} from '../../services/sharing';
import { supabase } from '../../services/supabase';

jest.mock('../../services/supabase');

beforeEach(() => {
  jest.clearAllMocks();
});

const mockMember = {
  id: 'member-1',
  list_id: 'list-1',
  user_id: 'user-2',
  role: 'viewer' as const,
  joined_at: '2024-01-01T00:00:00Z',
  profile: {
    id: 'user-2',
    email: 'friend@example.com',
    display_name: 'Friend',
    avatar_url: null,
  },
};

const mockProfile = {
  id: 'user-2',
  email: 'friend@example.com',
  display_name: 'Friend',
  avatar_url: null,
  created_at: '2024-01-01T00:00:00Z',
};

describe('sharing service', () => {
  describe('fetchMembers', () => {
    it('should fetch members for a list', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [mockMember],
              error: null,
            }),
          }),
        }),
      });

      const result = await fetchMembers('list-1');

      expect(result).toEqual([mockMember]);
      expect(supabase.from).toHaveBeenCalledWith('list_members');
    });

    it('should throw error on failure', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Fetch failed' },
            }),
          }),
        }),
      });

      await expect(fetchMembers('list-1')).rejects.toThrow('Fetch failed');
    });
  });

  describe('findUserByEmail', () => {
    it('should find a user by email', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      });

      const result = await findUserByEmail('friend@example.com');

      expect(result).toEqual(mockProfile);
      expect(supabase.from).toHaveBeenCalledWith('profiles');
    });

    it('should return null when user not found', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' },
            }),
          }),
        }),
      });

      const result = await findUserByEmail('notfound@example.com');

      expect(result).toBeNull();
    });

    it('should throw error on other failures', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Query failed' },
            }),
          }),
        }),
      });

      await expect(findUserByEmail('friend@example.com')).rejects.toThrow(
        'Query failed',
      );
    });
  });

  describe('inviteMember', () => {
    it('should invite a member to a list', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'member-2',
                list_id: 'list-1',
                user_id: 'user-3',
                role: 'viewer',
                joined_at: '2024-01-01T00:00:00Z',
              },
              error: null,
            }),
          }),
        }),
      });

      const result = await inviteMember('list-1', 'user-3', 'viewer');

      expect(result.user_id).toBe('user-3');
      expect(supabase.from).toHaveBeenCalledWith('list_members');
    });

    it('should throw error when member already exists', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: '23505' },
            }),
          }),
        }),
      });

      await expect(inviteMember('list-1', 'user-2')).rejects.toThrow(
        'This user is already a member of this list',
      );
    });

    it('should throw error on other failures', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Insert failed' },
            }),
          }),
        }),
      });

      await expect(inviteMember('list-1', 'user-3')).rejects.toThrow(
        'Insert failed',
      );
    });
  });

  describe('updateMemberRole', () => {
    it('should update a member role', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { ...mockMember, role: 'editor' },
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await updateMemberRole('member-1', 'editor');

      expect(result.role).toBe('editor');
    });

    it('should throw error on failure', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Update failed' },
              }),
            }),
          }),
        }),
      });

      await expect(updateMemberRole('member-1', 'editor')).rejects.toThrow(
        'Update failed',
      );
    });
  });

  describe('removeMember', () => {
    it('should remove a member', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: null,
          }),
        }),
      });

      await removeMember('member-1');

      expect(supabase.from).toHaveBeenCalledWith('list_members');
    });

    it('should throw error on failure', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: { message: 'Delete failed' },
          }),
        }),
      });

      await expect(removeMember('member-1')).rejects.toThrow('Delete failed');
    });
  });
});
