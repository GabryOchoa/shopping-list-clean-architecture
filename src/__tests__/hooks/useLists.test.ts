import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useLists } from '../../hooks/useLists';
import * as listsService from '../../services/lists';
import { mapError } from '../../utils/mapError';

jest.mock('../../services/lists');
jest.mock('../../utils/mapError');

const mockLists = [
  {
    id: 'list-1',
    owner_id: 'user-1',
    name: 'Groceries',
    description: 'Weekly groceries',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

const mockSharedEntries = [
  {
    list: {
      id: 'list-2',
      owner_id: 'user-2',
      name: 'Shared List',
      description: '',
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    },
    role: 'editor' as const,
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  (listsService.fetchLists as jest.Mock).mockResolvedValue(mockLists);
  (listsService.fetchSharedLists as jest.Mock).mockResolvedValue(
    mockSharedEntries,
  );
  (mapError as jest.Mock).mockImplementation((error) => error.message);
});

describe('useLists', () => {
  it('should load lists on mount', async () => {
    const { result } = await renderHook(() => useLists());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.lists).toEqual(mockLists);
    expect(result.current.sharedEntries).toEqual(mockSharedEntries);
    expect(result.current.error).toBeNull();
  });

  it('should handle error on load', async () => {
    (listsService.fetchLists as jest.Mock).mockRejectedValue(
      new Error('Load failed'),
    );

    const { result } = await renderHook(() => useLists());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Load failed');
    expect(result.current.lists).toEqual([]);
  });

  it('should add a list', async () => {
    const newList = {
      id: 'list-3',
      owner_id: 'user-1',
      name: 'New List',
      description: '',
      created_at: '2024-01-03T00:00:00Z',
      updated_at: '2024-01-03T00:00:00Z',
    };
    (listsService.createList as jest.Mock).mockResolvedValue(newList);

    const { result } = await renderHook(() => useLists());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addList('New List', '');
    });

    expect(result.current.lists).toContainEqual(newList);
    expect(listsService.createList).toHaveBeenCalledWith('New List', '');
  });

  it('should edit a list', async () => {
    const updatedList = { ...mockLists[0], name: 'Updated Groceries' };
    (listsService.updateList as jest.Mock).mockResolvedValue(updatedList);

    const { result } = await renderHook(() => useLists());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.editList('list-1', 'Updated Groceries');
    });

    expect(result.current.lists[0].name).toBe('Updated Groceries');
    expect(listsService.updateList).toHaveBeenCalledWith('list-1', {
      name: 'Updated Groceries',
      description: undefined,
    });
  });

  it('should remove a list optimistically and revert on error', async () => {
    (listsService.deleteList as jest.Mock).mockRejectedValue(
      new Error('Delete failed'),
    );

    const { result } = await renderHook(() => useLists());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.lists).toHaveLength(1);

    await act(async () => {
      await result.current.removeList('list-1');
    });

    expect(result.current.error).toBe('Delete failed');
    expect(result.current.lists).toEqual(mockLists);
  });

  it('should remove a list successfully', async () => {
    (listsService.deleteList as jest.Mock).mockResolvedValue(undefined);

    const { result } = await renderHook(() => useLists());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.lists).toHaveLength(1);

    await act(async () => {
      await result.current.removeList('list-1');
    });

    expect(result.current.lists).toEqual([]);
  });

  it('should refresh lists', async () => {
    const { result } = await renderHook(() => useLists());

    await waitFor(() => expect(result.current.loading).toBe(false));

    const newLists = [...mockLists, { ...mockLists[0], id: 'list-4' }];
    (listsService.fetchLists as jest.Mock).mockResolvedValue(newLists);

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.lists).toEqual(newLists);
  });
});
