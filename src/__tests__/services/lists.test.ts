import {
  fetchLists,
  fetchSharedLists,
  createList,
  updateList,
  deleteList,
} from '../../services/lists';
import { supabase } from '../../services/supabase';

jest.mock('../../services/supabase');

beforeEach(() => {
  jest.clearAllMocks();
});

const mockUserId = 'user-1';
const mockList = {
  id: 'list-1',
  owner_id: 'user-1',
  name: 'Groceries',
  description: 'Weekly groceries',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('lists service', () => {
  describe('fetchLists', () => {
    it('should fetch lists owned by user', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [mockList],
              error: null,
            }),
          }),
        }),
      });

      const result = await fetchLists(mockUserId);

      expect(result).toEqual([mockList]);
      expect(supabase.from).toHaveBeenCalledWith('lists');
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

      await expect(fetchLists(mockUserId)).rejects.toThrow('Fetch failed');
    });
  });

  describe('fetchSharedLists', () => {
    it('should fetch lists shared with user', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [{ role: 'editor', list: mockList }],
              error: null,
            }),
          }),
        }),
      });

      const result = await fetchSharedLists(mockUserId);

      expect(result).toEqual([{ list: mockList, role: 'editor' }]);
    });
  });

  describe('createList', () => {
    it('should create a new list', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockList,
              error: null,
            }),
          }),
        }),
      });

      const result = await createList(
        mockUserId,
        'Groceries',
        'Weekly groceries',
      );

      expect(result).toEqual(mockList);
      expect(supabase.from).toHaveBeenCalledWith('lists');
    });

    it('should throw error on failure', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Create failed' },
            }),
          }),
        }),
      });

      await expect(createList(mockUserId, 'Groceries')).rejects.toThrow(
        'Create failed',
      );
    });
  });

  describe('updateList', () => {
    it('should update a list', async () => {
      const updatedList = { ...mockList, name: 'Updated Groceries' };
      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: updatedList,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await updateList('list-1', {
        name: 'Updated Groceries',
      });

      expect(result).toEqual(updatedList);
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

      await expect(
        updateList('list-1', { name: 'Updated Groceries' }),
      ).rejects.toThrow('Update failed');
    });
  });

  describe('deleteList', () => {
    it('should delete a list', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: null,
          }),
        }),
      });

      await deleteList('list-1');

      expect(supabase.from).toHaveBeenCalledWith('lists');
    });

    it('should throw error on failure', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: { message: 'Delete failed' },
          }),
        }),
      });

      await expect(deleteList('list-1')).rejects.toThrow('Delete failed');
    });
  });
});
