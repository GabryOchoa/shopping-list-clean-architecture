import {
  fetchItems,
  createItem,
  updateItem,
  toggleItem,
  deleteItem,
} from '../../services/items';
import { supabase } from '../../services/supabase';

jest.mock('../../services/supabase');

beforeEach(() => {
  jest.clearAllMocks();
});

const mockItem = {
  id: 'item-1',
  list_id: 'list-1',
  name: 'Milk',
  quantity: 2,
  is_checked: false,
  created_at: '2024-01-01T00:00:00Z',
};

describe('items service', () => {
  describe('fetchItems', () => {
    it('should fetch items for a list', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [mockItem],
              error: null,
            }),
          }),
        }),
      });

      const result = await fetchItems('list-1');

      expect(result).toEqual([mockItem]);
      expect(supabase.from).toHaveBeenCalledWith('items');
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

      await expect(fetchItems('list-1')).rejects.toThrow('Fetch failed');
    });
  });

  describe('createItem', () => {
    it('should create a new item', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockItem,
              error: null,
            }),
          }),
        }),
      });

      const result = await createItem('list-1', 'Milk', 2);

      expect(result).toEqual(mockItem);
      expect(supabase.from).toHaveBeenCalledWith('items');
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

      await expect(createItem('list-1', 'Milk')).rejects.toThrow(
        'Create failed',
      );
    });
  });

  describe('updateItem', () => {
    it('should update an item', async () => {
      const updatedItem = { ...mockItem, name: 'Bread' };
      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: updatedItem,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await updateItem('item-1', { name: 'Bread' });

      expect(result).toEqual(updatedItem);
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

      await expect(updateItem('item-1', { name: 'Bread' })).rejects.toThrow(
        'Update failed',
      );
    });
  });

  describe('toggleItem', () => {
    it('should toggle item checked status', async () => {
      const toggledItem = { ...mockItem, is_checked: true };
      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: toggledItem,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await toggleItem('item-1', true);

      expect(result).toEqual(toggledItem);
    });
  });

  describe('deleteItem', () => {
    it('should delete an item', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: null,
          }),
        }),
      });

      await deleteItem('item-1');

      expect(supabase.from).toHaveBeenCalledWith('items');
    });

    it('should throw error on failure', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: { message: 'Delete failed' },
          }),
        }),
      });

      await expect(deleteItem('item-1')).rejects.toThrow('Delete failed');
    });
  });
});
