import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

/**
 * Shared hook for Supabase auth session management.
 * Replaces the repeated getSession + onAuthStateChange boilerplate
 * that was copy-pasted across 7+ components.
 *
 * @returns {import('@supabase/supabase-js').Session | null}
 */
export function useSession() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return session;
}
