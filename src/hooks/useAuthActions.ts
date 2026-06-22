import { useState, useCallback } from 'react';
import { signInWithGoogle, signOut } from '../services/auth';
import { mapError } from '../utils/mapError';

type UseAuthActionsReturn = {
  loading: boolean;
  error: string | null;
  handleSignIn: () => Promise<void>;
  handleSignOut: () => Promise<void>;
};

export function useAuthActions(): UseAuthActionsReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
    } catch (e: any) {
      setError(mapError(e));
      console.error('Google Sign-In Error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await signOut();
    } catch (e: any) {
      setError(mapError(e));
      console.error('Sign-Out Error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, handleSignIn, handleSignOut };
}
