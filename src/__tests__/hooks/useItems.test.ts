import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useItems } from '../../hooks/useItems';
import * as itemsService from '../../services/items';
import { mapError } from '../../utils/mapError';

jest.mock('../../services/items');
jest.mock('../../utils/mapError');

const mockItems = [
  {
    id: 'item-1',
    list_id: 'list-1',
    name: 'Milk',
    quantity: 2,
    is_checked: false,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'item-2',
    list_id: 'list-1',
    name: 'Bread',
    quantity: 1,
    is_checked: true,
    created_at: '2024-01-01T00:00:00Z',
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  (itemsService.fetchItems as jest.Mock).mockResolvedValue(mockItems);
  (mapError as jest.Mock).mockImplementation((error) => error.message);
});

describe('useItems', () => {
  it('should load items on mount', async () => {
    const { result } = await renderHook(() => useItems('list-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.items).toEqual(mockItems);
    expect(result.current.error).toBeNull();
  });

  it('should handle error on load', async () => {
    (itemsService.fetchItems as jest.Mock).mockRejectedValue(
      new Error('Load failed'),
    );

    const { result } = await renderHook(() => useItems('list-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Load failed');
    expect(result.current.items).toEqual([]);
  });

  it('should add an item', async () => {
    const newItem = {
      id: 'item-3',
      list_id: 'list-1',
      name: 'Eggs',
      quantity: 12,
      is_checked: false,
      created_at: '2024-01-02T00:00:00Z',
    };
    (itemsService.createItem as jest.Mock).mockResolvedValue(newItem);

    const { result } = await renderHook(() => useItems('list-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addItem('Eggs', 12);
    });

    expect(result.current.items).toContainEqual(newItem);
    expect(itemsService.createItem).toHaveBeenCalledWith('list-1', 'Eggs', 12);
  });

  it('should edit an item', async () => {
    const updatedItem = { ...mockItems[0], name: 'Whole Milk' };
    (itemsService.updateItem as jest.Mock).mockResolvedValue(updatedItem);

    const { result } = await renderHook(() => useItems('list-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.editItem('item-1', 'Whole Milk', 2);
    });

    expect(result.current.items[0].name).toBe('Whole Milk');
    expect(itemsService.updateItem).toHaveBeenCalledWith('item-1', {
      name: 'Whole Milk',
      quantity: 2,
    });
  });

  it('should toggle item optimistically and revert on error', async () => {
    (itemsService.toggleItem as jest.Mock).mockRejectedValue(
      new Error('Toggle failed'),
    );

    const { result } = await renderHook(() => useItems('list-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.items[0].is_checked).toBe(false);

    await act(async () => {
      await result.current.checkItem('item-1', true);
    });

    expect(result.current.items[0].is_checked).toBe(false);
  });

  it('should toggle item successfully', async () => {
    (itemsService.toggleItem as jest.Mock).mockResolvedValue({
      ...mockItems[0],
      is_checked: true,
    });

    const { result } = await renderHook(() => useItems('list-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.checkItem('item-1', true);
    });

    expect(result.current.items[0].is_checked).toBe(true);
  });

  it('should remove an item optimistically and revert on error', async () => {
    (itemsService.deleteItem as jest.Mock).mockRejectedValue(
      new Error('Delete failed'),
    );

    const { result } = await renderHook(() => useItems('list-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.items).toHaveLength(2);

    await act(async () => {
      await result.current.removeItem('item-1');
    });

    expect(result.current.error).toBe('Delete failed');
    expect(result.current.items).toEqual(mockItems);
  });

  it('should remove an item successfully', async () => {
    (itemsService.deleteItem as jest.Mock).mockResolvedValue(undefined);

    const { result } = await renderHook(() => useItems('list-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.removeItem('item-1');
    });

    expect(result.current.items).toEqual([mockItems[1]]);
  });

  it('should refresh items', async () => {
    const { result } = await renderHook(() => useItems('list-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    const newItems = [...mockItems, { ...mockItems[0], id: 'item-4' }];
    (itemsService.fetchItems as jest.Mock).mockResolvedValue(newItems);

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.items).toEqual(newItems);
  });
});
