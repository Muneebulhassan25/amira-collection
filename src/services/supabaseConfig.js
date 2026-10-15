const viteEnv = import.meta.env || {};

const isPlaceholder = (value = '') => /your-project-ref|your-supabase-publishable-key|placeholder/i.test(value);
const isValidSupabaseUrl = (value = '') => {
  try { const parsed = new URL(value); return parsed.protocol === 'https:' && Boolean(parsed.hostname); }
  catch { return false; }
};
const url = viteEnv.VITE_SUPABASE_URL || '';
const publishableKey = viteEnv.VITE_SUPABASE_PUBLISHABLE_KEY || '';

export const supabaseConfigured = Boolean(isValidSupabaseUrl(url) && publishableKey && !isPlaceholder(url) && !isPlaceholder(publishableKey));
export const supabaseSelected = viteEnv.VITE_DATA_MODE === 'supabase' && supabaseConfigured;
export const supabaseWritesEnabled = supabaseSelected && viteEnv.VITE_SUPABASE_ENABLE_WRITES === 'true';
export const supabaseEnvironmentMessage = viteEnv.VITE_DATA_MODE === 'supabase' && !supabaseConfigured
  ? 'Supabase mode was requested, but valid project URL and publishable key values are missing. Local preview remains active.'
  : '';

export function getBackendMode(env = viteEnv) {
  return getBackendSettings(env).mode;
}

export function getBackendSettings(env = viteEnv) {
  const configuredUrl = env.VITE_SUPABASE_URL || '';
  const configuredKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
  const configured = Boolean(isValidSupabaseUrl(configuredUrl) && configuredKey && !isPlaceholder(configuredUrl) && !isPlaceholder(configuredKey));
  const mode = env.VITE_DATA_MODE === 'supabase' && configured ? 'supabase' : 'local';
  return { mode, configured, writesEnabled: mode === 'supabase' && env.VITE_SUPABASE_ENABLE_WRITES === 'true' };
}
