import { createClient } from '@supabase/supabase-js';
import { supabaseConfigured } from './supabaseConfig.js';

const env = import.meta.env || {};

// The publishable key is intended for browser use. Database RLS, not this key,
// protects data. Never put a service-role or secret key in VITE_* variables.
export const supabase = supabaseConfigured
  ? createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;
