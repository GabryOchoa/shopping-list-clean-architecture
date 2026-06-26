import { signInWithGoogle, signOut } from '../../services/auth';
import { supabase } from '../../services/supabase';
import * as WebBrowser from 'expo-web-browser';

jest.mock('../../services/supabase');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('auth service', () => {
  describe('signInWithGoogle', () => {
    it('should open auth session and exchange code on success', async () => {
      (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
        data: { url: 'https://accounts.google.com/o/oauth2/auth' },
        error: null,
      });
      (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue({
        type: 'success',
        url: 'exp://localhost:19000/--/auth/callback?code=auth_code',
      });
      (supabase.auth.exchangeCodeForSession as jest.Mock).mockResolvedValue({
        error: null,
      });

      await signInWithGoogle();

      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.any(String),
          skipBrowserRedirect: true,
        },
      });
      expect(WebBrowser.openAuthSessionAsync).toHaveBeenCalledWith(
        'https://accounts.google.com/o/oauth2/auth',
        expect.any(String),
      );
      expect(supabase.auth.exchangeCodeForSession).toHaveBeenCalledWith(
        'auth_code',
      );
    });

    it('should throw error when OAuth fails', async () => {
      (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
        data: { url: null },
        error: { message: 'OAuth failed' },
      });

      await expect(signInWithGoogle()).rejects.toMatchObject({
        message: 'OAuth failed',
      });
    });

    it('should throw error when no URL returned', async () => {
      (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
        data: { url: null },
        error: null,
      });

      await expect(signInWithGoogle()).rejects.toThrow(
        'Failed to get authentication URL',
      );
    });

    it('should handle cancelled auth session', async () => {
      (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
        data: { url: 'https://accounts.google.com/o/oauth2/auth' },
        error: null,
      });
      (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue({
        type: 'cancel',
        url: '',
      });

      await signInWithGoogle();

      expect(supabase.auth.exchangeCodeForSession).not.toHaveBeenCalled();
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({ error: null });

      await signOut();

      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('should throw error when signOut fails', async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: { message: 'Sign out failed' },
      });

      await expect(signOut()).rejects.toMatchObject({
        message: 'Sign out failed',
      });
    });
  });
});
