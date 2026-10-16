import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabase/client.js';
import { isSupabaseConfigured } from '../config/config.js';
import { normalizeRole } from './access.js';

const AuthContext = createContext(null);
const DEFAULT_PROFILE = { role: 'student', language_access: [], course_level: '*', ui_lang: null };

async function loadProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, display_name, ui_lang, language_access, course_level')
    .eq('id', userId)
    .maybeSingle();
  if (error || !data) return { ...DEFAULT_PROFILE, id: userId };
  return { ...data, role: normalizeRole(data.role) };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) return undefined;
    let active = true;

    const apply = async (next) => {
      setSession(next);
      setProfile(next?.user ? await loadProfile(next.user.id) : null);
      if (active) setLoading(false);
    };

    supabase.auth.getSession().then(({ data }) => apply(data.session));
    // Never await Supabase calls inside this callback (deadlock risk); defer instead.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setTimeout(() => apply(next), 0);
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);

  const signIn = useCallback((email, password) => supabase.auth.signInWithPassword({ email, password }), []);
  const signOut = useCallback(() => supabase.auth.signOut(), []);

  const value = useMemo(
    () => ({ configured: isSupabaseConfigured, session, user: session?.user ?? null, profile, loading, signIn, signOut }),
    [session, profile, loading, signIn, signOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
