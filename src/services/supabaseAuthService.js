import { supabase } from './supabaseClient.js';
import { supabaseSelected } from './supabaseConfig.js';

export function createSupabaseAuthService(client, isSelected = true) {
  return {
    getStatus() {
      return { configured: Boolean(client && isSelected), authenticated: false, authorized: false, mode: isSelected ? 'supabase' : 'preview-only' };
    },
    async getStaffSession() {
      if (!client || !isSelected) return { configured: false, authenticated: false, authorized: false };
      const { data: sessionResult, error: sessionError } = await client.auth.getSession();
      if (sessionError) throw sessionError;
      const user = sessionResult.session?.user;
      if (!user) return { configured: true, authenticated: false, authorized: false };
      const { data: staffRole, error } = await client.from('staff_roles').select('role').eq('user_id', user.id).maybeSingle();
      if (error) throw error;
      return { configured: true, authenticated: true, authorized: Boolean(staffRole), role: staffRole?.role || null, user };
    },
    async signIn({ email, password }) {
      if (!client || !isSelected) return { ok: false, error: 'Supabase authentication is not configured. Local preview remains active.' };
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) return { ok: false, error: error.message };
      try {
        const status = await this.getStaffSession();
        if (!status.authorized) {
          await client.auth.signOut();
          return { ok: false, error: 'This account is not assigned an authorized store staff role.' };
        }
        return { ok: true, user: status.user, role: status.role };
      } catch (error) {
        await client.auth.signOut();
        return { ok: false, error: error?.message || 'Could not verify store staff access.' };
      }
    },
    async signOut() {
      if (!client || !isSelected) return { ok: true };
      const { error } = await client.auth.signOut();
      return error ? { ok: false, error: error.message } : { ok: true };
    },
    onAuthStateChange(callback) {
      if (!client || !isSelected) return () => {};
      const { data } = client.auth.onAuthStateChange(callback);
      return () => data.subscription.unsubscribe();
    },
  };
}

export const supabaseAuthService = createSupabaseAuthService(supabase, supabaseSelected);
