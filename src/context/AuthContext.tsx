import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load existing session on app start
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth state changes (login / logout)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Ensure profile exists whenever user changes — fire-and-forget,
  // separated from onAuthStateChange to avoid contention during data fetching
  // Only run on user change (new login), not on every session refresh
  useEffect(() => {
    if (!session?.user) return;

    const upsertProfile = async () => {
      try {
        await supabase.from('profiles').upsert({
          id: session!.user.id,
          email: session!.user.email,
        });
      } catch {
        // Profile upsert is best-effort; don't block auth flow
      }
    };

    upsertProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user]);

  return (
    <AuthContext.Provider
      value={{ user: session?.user ?? null, session, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
