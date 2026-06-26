import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useLists } from '../../hooks/useLists';
import { useItems } from '../../hooks/useItems';
import { useShareList } from '../../hooks/useShareList';
import * as listsService from '../../services/lists';
import * as itemsService from '../../services/items';
import * as sharingService from '../../services/sharing';
import { mapError } from '../../utils/mapError';
import { supabase } from '../../services/supabase';

jest.mock('../../services/lists');
jest.mock('../../services/items');
jest.mock('../../services/sharing');
jest.mock('../../services/supabase');
jest.mock('../../utils/mapError');

const mockUser = { id: 'user-1', email: 'owner@example.com' };
const mockSession = { user: mockUser };

beforeEach(() => {
  jest.clearAllMocks();
  (mapError as jest.Mock).mockImplementation((error) => error.message);
  (supabase.auth.getSession as jest.Mock).mockResolvedValue({
    data: { session: mockSession },
    error: null,
  });
  (supabase.auth.getUser as jest.Mock).mockResolvedValue({
    data: { user: mockUser },
    error: null,
  });
});

describe('Critical user flow', () => {
  it('should complete login → create list → add item → share list', async () => {
    // Step 1: Create a list
    const mockList = {
      id: 'list-1',
      owner_id: 'user-1',
      name: 'Weekly Groceries',
      description: 'Milk, bread, eggs',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };
    (listsService.fetchLists as jest.Mock).mockResolvedValue([]);
    (listsService.fetchSharedLists as jest.Mock).mockResolvedValue([]);
    (listsService.createList as jest.Mock).mockResolvedValue(mockList);

    const { result: listsResult } = await renderHook(() => useLists());

    await waitFor(() => expect(listsResult.current.loading).toBe(false));

    await act(async () => {
      await listsResult.current.addList(
        'Weekly Groceries',
        'Milk, bread, eggs',
      );
    });

    expect(listsResult.current.lists).toContainEqual(mockList);

    // Step 2: Add an item to the list
    const mockItem = {
      id: 'item-1',
      list_id: 'list-1',
      name: 'Milk',
      quantity: 2,
      is_checked: false,
      created_at: '2024-01-01T00:00:00Z',
    };
    (itemsService.fetchItems as jest.Mock).mockResolvedValue([]);
    (itemsService.createItem as jest.Mock).mockResolvedValue(mockItem);

    const { result: itemsResult } = await renderHook(() => useItems('list-1'));

    await waitFor(() => expect(itemsResult.current.loading).toBe(false));

    await act(async () => {
      await itemsResult.current.addItem('Milk', 2);
    });

    expect(itemsResult.current.items).toContainEqual(mockItem);

    // Step 3: Share the list with another user
    const mockFriend = {
      id: 'user-2',
      email: 'friend@example.com',
      display_name: 'Friend',
      avatar_url: null,
      created_at: '2024-01-01T00:00:00Z',
    };
    const mockMember = {
      id: 'member-1',
      list_id: 'list-1',
      user_id: 'user-2',
      role: 'viewer' as const,
      joined_at: '2024-01-01T00:00:00Z',
    };
    (sharingService.fetchMembers as jest.Mock).mockResolvedValue([]);
    (sharingService.findUserByEmail as jest.Mock).mockResolvedValue(mockFriend);
    (sharingService.inviteMember as jest.Mock).mockResolvedValue(mockMember);
    (sharingService.fetchMembers as jest.Mock).mockResolvedValue([
      {
        ...mockMember,
        profile: {
          id: 'user-2',
          email: 'friend@example.com',
          display_name: 'Friend',
          avatar_url: null,
        },
      },
    ]);

    const { result: shareResult } = await renderHook(() =>
      useShareList('list-1'),
    );

    await waitFor(() => expect(shareResult.current.loading).toBe(false));

    await act(async () => {
      await shareResult.current.inviteByEmail('friend@example.com', 'viewer');
    });

    expect(shareResult.current.members).toHaveLength(1);
    expect(shareResult.current.members[0].role).toBe('viewer');

    // Verify all services were called correctly
    expect(listsService.createList).toHaveBeenCalledWith(
      'Weekly Groceries',
      'Milk, bread, eggs',
    );
    expect(itemsService.createItem).toHaveBeenCalledWith('list-1', 'Milk', 2);
    expect(sharingService.findUserByEmail).toHaveBeenCalledWith(
      'friend@example.com',
    );
    expect(sharingService.inviteMember).toHaveBeenCalledWith(
      'list-1',
      'user-2',
      'viewer',
    );
  });
});
