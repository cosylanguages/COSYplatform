import { createClient } from '@supabase/supabase-js';
import { config, isSupabaseConfigured } from '../config/config.js';

// null when env is missing, so the app can show a clear "not configured" state.
export const supabase = isSupabaseConfigured
  ? createClient(config.supabaseUrl, config.supabaseAnonKey)
  : null;
