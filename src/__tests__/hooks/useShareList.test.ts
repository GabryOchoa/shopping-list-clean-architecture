import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useShareList } from '../../hooks/useShareList';
import * as sharingService from '../../services/sharing';
import { mapError } from '../../utils/mapError';

jest.mock('../../services/sharing');
jest.mock('../../utils/mapError');

const mockMembers = [
  {
    id: 'member-1',
    list_id: 'list-1',
    user_id: 'user-1',
    role: 'owner' as const,
    joined_at: '2024-01-01T00:00:00Z',
    profile: {
      id: 'user-1',
      email: 'owner@example.com',
      display_name: 'Owner',
      avatar_url: null,
    },
  },
  {
    id: 'member-2',
    list_id: 'list-1',
    user_id: 'user-2',
    role: 'viewer' as const,
    joined_at: '2024-01-02T00:00:00Z',
    profile: {
      id: 'user-2',
      email: 'viewer@example.com',
      display_name: 'Viewer',
      avatar_url: null,
    },
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  (sharingService.fetchMembers as jest.Mock).mockResolvedValue(mockMembers);
  (mapError as jest.Mock).mockImplementation((error) => error.message);
});

describe('useShareList', () => {
  it('should load members on mount', async () => {
    const { result } = await renderHook(() => useShareList('list-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.members).toEqual(mockMembers);
    expect(result.current.error).toBeNull();
  });

  it('should handle error on load', async () => {
    (sharingService.fetchMembers as jest.Mock).mockRejectedValue(
      new Error('Load failed'),
    );

    const { result } = await renderHook(() => useShareList('list-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Load failed');
    expect(result.current.members).toEqual([]);
  });

  it('should invite a member by email', async () => {
    const newMember = {
      id: 'member-3',
      list_id: 'list-1',
      user_id: 'user-3',
      role: 'editor' as const,
      joined_at: '2024-01-03T00:00:00Z',
      profile: {
        id: 'user-3',
        email: 'new@example.com',
        display_name: 'New User',
        avatar_url: null,
      },
    };
    (sharingService.findUserByEmail as jest.Mock).mockResolvedValue({
      id: 'user-3',
      email: 'new@example.com',
      display_name: 'New User',
      avatar_url: null,
      created_at: '2024-01-01T00:00:00Z',
    });
    (sharingService.inviteMember as jest.Mock).mockResolvedValue({
      id: 'member-3',
      list_id: 'list-1',
      user_id: 'user-3',
      role: 'editor',
      joined_at: '2024-01-03T00:00:00Z',
    });
    (sharingService.fetchMembers as jest.Mock).mockResolvedValue([
      ...mockMembers,
      newMember,
    ]);

    const { result } = await renderHook(() => useShareList('list-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.inviteByEmail('new@example.com', 'editor');
    });

    expect(sharingService.findUserByEmail).toHaveBeenCalledWith(
      'new@example.com',
    );
    expect(sharingService.inviteMember).toHaveBeenCalledWith(
      'list-1',
      'user-3',
      'editor',
    );
  });

  it('should throw error when user not found', async () => {
    (sharingService.findUserByEmail as jest.Mock).mockResolvedValue(null);

    const { result } = await renderHook(() => useShareList('list-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(
      act(async () => {
        await result.current.inviteByEmail('notfound@example.com', 'viewer');
      }),
    ).rejects.toThrow('No account found with that email address');
  });

  it('should change member role', async () => {
    (sharingService.updateMemberRole as jest.Mock).mockResolvedValue({
      ...mockMembers[1],
      role: 'editor',
    });

    const { result } = await renderHook(() => useShareList('list-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.changeRole('member-2', 'editor');
    });

    expect(result.current.members[1].role).toBe('editor');
    expect(sharingService.updateMemberRole).toHaveBeenCalledWith(
      'member-2',
      'editor',
    );
  });

  it('should remove a member', async () => {
    (sharingService.removeMember as jest.Mock).mockResolvedValue(undefined);

    const { result } = await renderHook(() => useShareList('list-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.members).toHaveLength(2);

    await act(async () => {
      await result.current.kickMember('member-2');
    });

    expect(result.current.members).toHaveLength(1);
    expect(sharingService.removeMember).toHaveBeenCalledWith('member-2');
  });

  it('should refresh members', async () => {
    const { result } = await renderHook(() => useShareList('list-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    const newMembers = [...mockMembers, { ...mockMembers[0], id: 'member-3' }];
    (sharingService.fetchMembers as jest.Mock).mockResolvedValue(newMembers);

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.members).toEqual(newMembers);
  });
});
