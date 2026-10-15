import { createDefaultStoreData } from '../data/storeDefaults.js';
import { createSupabaseStoreDataService } from './supabaseStoreDataService.js';
import { supabaseSelected, supabaseEnvironmentMessage } from './supabaseConfig.js';

export const STORE_DATA_STORAGE_KEY = 'atelier-nisa-admin-preview-v1';

function browserStorage() {
  try { return typeof window === 'undefined' ? null : window.localStorage; } catch { return null; }
}

// This adapter intentionally stores preview edits only in this browser. A remote
// service can replace it later without changing screens or storefront models.
export function createDemoStoreDataService(storage = browserStorage()) {
  return {
    mode: 'Local browser preview',
    isLocalOnly: true,
    read() {
      if (!storage) return createDefaultStoreData();
      try {
        const saved = storage.getItem(STORE_DATA_STORAGE_KEY);
        if (!saved) return createDefaultStoreData();
        const parsed = JSON.parse(saved);
        const defaults = createDefaultStoreData();
        if (parsed?.version !== 1) return defaults;
        const settings = { ...defaults.settings, ...parsed.settings };
        // Preserve local edits while replacing only the original default brand value.
        if (settings.storeName === 'Atelier Nisa') settings.storeName = defaults.settings.storeName;
        return {
          ...defaults,
          ...parsed,
          products: Array.isArray(parsed.products) ? parsed.products : defaults.products,
          collections: Array.isArray(parsed.collections) ? parsed.collections : defaults.collections,
          homepage: { ...defaults.homepage, ...parsed.homepage, sections: { ...defaults.homepage.sections, ...parsed.homepage?.sections } },
          settings,
        };
      } catch { return createDefaultStoreData(); }
    },
    save(data) {
      if (!storage) return { ok: false, error: 'Browser storage is unavailable. Changes could not be saved.' };
      try {
        storage.setItem(STORE_DATA_STORAGE_KEY, JSON.stringify({ ...data, version: 1 }));
        return { ok: true };
      } catch { return { ok: false, error: 'Browser storage is unavailable or full. Changes could not be saved.' }; }
    },
  };
}

export const localPreviewStoreDataService = createDemoStoreDataService();
export const storeDataService = supabaseSelected
  ? createSupabaseStoreDataService()
  : {
      ...localPreviewStoreDataService,
      mode: supabaseEnvironmentMessage ? 'Local browser preview (Supabase configuration incomplete)' : localPreviewStoreDataService.mode,
      canWrite: true,
      isRemote: false,
      configurationMessage: supabaseEnvironmentMessage,
    };
