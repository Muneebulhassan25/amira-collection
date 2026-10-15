import { supabaseAuthService } from './supabaseAuthService.js';
import { supabaseSelected } from './supabaseConfig.js';

// Local preview deliberately stays available without pretending to authenticate.
export const adminAuthService = supabaseSelected ? supabaseAuthService : {
  getStatus() { return { configured: false, authenticated: false, mode: 'preview-only' }; },
  async getStaffSession() { return { configured: false, authenticated: false, authorized: false }; },
  async signIn() { return { ok: false, error: 'Authentication is not configured. This admin is a local preview.' }; },
  async signOut() { return { ok: true }; },
  onAuthStateChange() { return () => {}; },
};
