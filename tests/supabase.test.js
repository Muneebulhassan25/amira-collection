import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { getBackendMode, getBackendSettings } from '../src/services/supabaseConfig.js';
import { createSupabaseStoreDataService } from '../src/services/supabaseStoreDataService.js';
import { createSupabaseAuthService } from '../src/services/supabaseAuthService.js';

test('Supabase remains opt-in, rejects placeholders, and keeps writes explicitly gated', () => {
  assert.equal(getBackendMode({ VITE_DATA_MODE: 'local' }), 'local');
  assert.equal(getBackendMode({ VITE_DATA_MODE: 'supabase', VITE_SUPABASE_URL: 'https://your-project-ref.supabase.co', VITE_SUPABASE_PUBLISHABLE_KEY: 'your-supabase-publishable-key' }), 'local');
  const readOnly = getBackendSettings({ VITE_DATA_MODE: 'supabase', VITE_SUPABASE_URL: 'https://project-ref.supabase.co', VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_example' });
  assert.deepEqual(readOnly, { mode: 'supabase', configured: true, writesEnabled: false });
  assert.deepEqual(getBackendSettings({ VITE_DATA_MODE: 'supabase', VITE_SUPABASE_URL: 'not-a-url', VITE_SUPABASE_PUBLISHABLE_KEY: 'key', VITE_SUPABASE_ENABLE_WRITES: 'true' }), { mode: 'local', configured: false, writesEnabled: false });
  assert.equal(getBackendSettings({ VITE_DATA_MODE: 'supabase', VITE_SUPABASE_URL: 'https://project-ref.supabase.co', VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_example', VITE_SUPABASE_ENABLE_WRITES: 'true' }).writesEnabled, true);
});

test('Supabase service refuses writes by default and requires a loaded remote snapshot', async () => {
  const client = { auth: { getSession: async () => ({ data: { session: null }, error: null }) } };
  const readOnly = createSupabaseStoreDataService(client, { writesEnabled: false, isSelected: true });
  const denied = await readOnly.save({ products: [], collections: [], homepage: {}, settings: {} });
  assert.equal(denied.ok, false);
  assert.match(denied.error, /read-only/i);
  const writableButUnloaded = createSupabaseStoreDataService(client, { writesEnabled: true, isSelected: true });
  const noSnapshot = await writableButUnloaded.save({ products: [], collections: [], homepage: {}, settings: {} });
  assert.equal(noSnapshot.ok, false);
  assert.match(noSnapshot.error, /load the Supabase data/i);
});

test('Supabase login accepts only existing staff roles and exposes no staff sign-up method', async () => {
  let currentUser = null;
  let role = null;
  let signedOut = false;
  const client = {
    auth: {
      getSession: async () => ({ data: { session: currentUser ? { user: currentUser } : null }, error: null }),
      signInWithPassword: async () => { currentUser = { id: 'user-1', email: 'staff@example.test' }; return { error: null }; },
      signOut: async () => { signedOut = true; currentUser = null; return { error: null }; },
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    },
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: role, error: null }) }) }) }),
  };
  const auth = createSupabaseAuthService(client);
  assert.equal(auth.signUp, undefined);
  assert.equal((await auth.signIn({ email: 'staff@example.test', password: 'entered-by-user' })).ok, false);
  assert.equal(signedOut, true);
  role = { role: 'editor' };
  signedOut = false;
  const allowed = await auth.signIn({ email: 'staff@example.test', password: 'entered-by-user' });
  assert.equal(allowed.ok, true);
  assert.equal(allowed.role, 'editor');
  assert.equal(signedOut, false);
});

test('migration establishes staff-only write rules and a private published-image bucket', async () => {
  const sql = await readFile(new URL('../supabase/migrations/20261015000000_store_backend_foundation.sql', import.meta.url), 'utf8');
  assert.match(sql, /enable row level security/gi);
  assert.match(sql, /status = 'published'/i);
  assert.match(sql, /private\.is_store_staff\(\)/i);
  assert.match(sql, /public\.save_store_snapshot/i);
  assert.match(sql, /security invoker/i);
  assert.match(sql, /values \('product-images', 'product-images', false/i);
  assert.match(sql, /Published product images readable/i);
  assert.match(sql, /Staff upload product images/i);
  assert.doesNotMatch(sql, /insert into public\.orders/i);
});
