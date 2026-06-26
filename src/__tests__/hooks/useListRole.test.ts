import { renderHook, waitFor } from '@testing-library/react-native';
import { useListRole } from '../../hooks/useListRole';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';

jest.mock('../../context/AuthContext');
jest.mock('../../services/supabase');

beforeEach(() => {
  jest.clearAllMocks();
});

const mockUser = { id: 'user-1', email: 'owner@example.com' };

describe('useListRole', () => {
  it('should return owner role when user is the owner', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });

    const { result } = await renderHook(() => useListRole('list-1', 'user-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.role).toBe('owner');
  });

  it('should fetch role from list_members when user is not owner', async () => {
    const otherUser = { id: 'user-2', email: 'other@example.com' };
    (useAuth as jest.Mock).mockReturnValue({ user: otherUser });
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { role: 'editor' },
              error: null,
            }),
          }),
        }),
      }),
    });

    const { result } = await renderHook(() => useListRole('list-1', 'user-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.role).toBe('editor');
  });

  it('should return null role when user is not a member', async () => {
    const otherUser = { id: 'user-3', email: 'stranger@example.com' };
    (useAuth as jest.Mock).mockReturnValue({ user: otherUser });
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      }),
    });

    const { result } = await renderHook(() => useListRole('list-1', 'user-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.role).toBeNull();
  });

  it('should handle error gracefully', async () => {
    const otherUser = { id: 'user-2', email: 'other@example.com' };
    (useAuth as jest.Mock).mockReturnValue({ user: otherUser });
    (supabase.from as jest.Mock).mockImplementation(() => {
      throw new Error('DB error');
    });

    const { result } = await renderHook(() => useListRole('list-1', 'user-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.role).toBeNull();
  });

  it('should return null when no user is authenticated', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });

    const { result } = await renderHook(() => useListRole('list-1', 'user-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.role).toBeNull();
  });
});
