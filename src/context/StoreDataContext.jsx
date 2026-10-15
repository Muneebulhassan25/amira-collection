import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { storeDataService } from '../services/storeDataService.js';
import { supabaseSelected } from '../services/supabaseConfig.js';
import { deleteProductFromData, saveProductToData, syncFeaturedProducts } from '../utils/adminProducts.js';
import { createDefaultStoreData } from '../data/storeDefaults.js';

const StoreDataContext = createContext(null);

export function StoreDataProvider({ children }) {
  const [data, setData] = useState(() => {
    const defaults = createDefaultStoreData();
    return supabaseSelected ? { ...defaults, products: [], collections: [], homepage: { ...defaults.homepage, featuredProductIds: [], newArrivalProductIds: [], featuredCollectionIds: [] } } : defaults;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const refresh = useCallback(async ({ showLoading = true } = {}) => {
    if (showLoading) setIsLoading(true);
    try { const loaded = await storeDataService.read(); setData(loaded); setLoadError(''); return { ok: true }; }
    catch (error) { setLoadError(error?.message || 'Store content could not be loaded.'); return { ok: false, error: error?.message }; }
    finally { if (showLoading) setIsLoading(false); }
  }, []);
  useEffect(() => {
    let active = true;
    refresh().then(() => { if (!active) return; });
    return () => { active = false; };
  }, [refresh]);
  const persist = useCallback(async (next) => {
    try {
      const result = await storeDataService.save(next);
    if (result?.ok) { setData(next); setLoadError(''); }
      return result || { ok: false, error: 'The preview service did not confirm the save.' };
    } catch (error) {
      return { ok: false, error: error?.message || 'The changes could not be saved.' };
    }
  }, []);
  useEffect(() => {
    function onStorage(event) {
      if (event.key === 'atelier-nisa-admin-preview-v1') Promise.resolve(storeDataService.read()).then(setData).catch(() => {});
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  const value = useMemo(() => ({
    ...data,
    isLoading,
    loadError,
    refresh,
    persistenceMode: storeDataService.mode,
    isLocalOnly: storeDataService.isLocalOnly,
    canWrite: storeDataService.canWrite !== false,
    saveProduct(product) {
      const next = saveProductToData(data, product);
      const arrivals = new Set(next.homepage.newArrivalProductIds);
      if (product.isNewArrival) arrivals.add(product.id); else arrivals.delete(product.id);
      next.homepage = { ...next.homepage, newArrivalProductIds: [...arrivals] };
      const featured = new Set(next.homepage.featuredProductIds);
      if (product.featured) featured.add(product.id); else featured.delete(product.id);
      next.homepage.featuredProductIds = [...featured];
      return persist(next);
    },
    deleteProduct(id) { return persist(deleteProductFromData(data, id)); },
    saveCollections(collections) { return persist({ ...data, collections }); },
    saveCollectionSetup(collections, products, homepage) { return persist({ ...data, collections, products, homepage }); },
    saveHomepage(homepage) { return persist({ ...data, homepage, products: syncFeaturedProducts(data.products, homepage.featuredProductIds) }); },
    saveSettings(settings) { return persist({ ...data, settings }); },
    saveStoreSettings(settings, homepage) { return persist({ ...data, settings, homepage }); },
    saveProducts(products) { return persist({ ...data, products }); },
  }), [data, isLoading, loadError, refresh, persist]);
  return <StoreDataContext.Provider value={value}>{children}</StoreDataContext.Provider>;
}

export function useStoreData() {
  const context = useContext(StoreDataContext);
  if (!context) throw new Error('useStoreData must be used within StoreDataProvider');
  return context;
}
