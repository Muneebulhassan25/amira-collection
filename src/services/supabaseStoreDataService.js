import { supabase } from './supabaseClient.js';
import { supabaseSelected, supabaseWritesEnabled } from './supabaseConfig.js';

const throwOnError = ({ data, error }) => { if (error) throw error; return data; };
const collectionColumns = 'id,title,description,image_url,display_status,featured_on_homepage,position';

const STORAGE_REFERENCE_PREFIX = 'storage://product-images/';

async function resolveImage(client, reference) {
  if (!reference?.startsWith(STORAGE_REFERENCE_PREFIX)) return reference || '';
  const objectPath = reference.slice(STORAGE_REFERENCE_PREFIX.length);
  const { data, error } = await client.storage.from('product-images').createSignedUrl(objectPath, 3600);
  if (error) throw error;
  return data.signedUrl;
}

function toImageReference(value = '') {
  const marker = '/storage/v1/object/sign/product-images/';
  const markerIndex = value.indexOf(marker);
  if (markerIndex < 0) return value;
  const objectPath = decodeURIComponent(value.slice(markerIndex + marker.length).split('?')[0]);
  return `${STORAGE_REFERENCE_PREFIX}${objectPath}`;
}

async function fromProduct(client, row, collectionIds = []) {
  const images = await Promise.all((row.images || []).map((image) => resolveImage(client, image)));
  const image = await resolveImage(client, row.image_url || images[0] || '');
  const mainImageIndex = Math.max(0, (row.images || []).findIndex((reference) => reference === row.image_url));
  return {
    id: row.id, name: row.name, description: row.description, category: row.category,
    price: Number(row.price), compareAt: row.compare_at == null ? undefined : Number(row.compare_at),
    sku: row.sku || '', inventoryQuantity: row.inventory_quantity, sizes: row.sizes || [], colors: row.colors || [],
    tags: row.tags || [], images, image, mainImageIndex,
    color: row.default_color || row.colors?.[0] || '', label: row.label || '', status: row.status,
    featured: row.featured, isNewArrival: row.is_new_arrival, onSale: row.on_sale,
    arrivalDate: row.arrival_date || '', bestSellerRank: row.best_seller_rank, relevanceRank: row.relevance_rank, collectionIds,
  };
}

function toProduct(product) {
  return {
    id: product.id, name: product.name, description: product.description, category: product.category,
    price: product.price, compare_at: product.compareAt ?? null, sku: product.sku || null,
    inventory_quantity: product.inventoryQuantity ?? null, sizes: product.sizes || [], colors: product.colors || [],
    tags: product.tags || [], images: (product.images?.length ? product.images : (product.image ? [product.image] : [])).map(toImageReference),
    image_url: toImageReference(product.image || product.images?.[0] || '') || null, default_color: product.color || null, label: product.label || null,
    status: product.status || 'draft', featured: product.featured === true, is_new_arrival: product.isNewArrival === true,
    on_sale: product.onSale === true, arrival_date: product.arrivalDate || null,
    best_seller_rank: product.bestSellerRank ?? null, relevance_rank: product.relevanceRank ?? null,
  };
}

function toCollection(collection, index) {
  return { id: collection.id, title: collection.title, description: collection.description || '', image_url: toImageReference(collection.image || '') || null, display_status: collection.displayStatus || 'draft', featured_on_homepage: collection.featuredOnHomepage === true, position: index };
}

export function createSupabaseStoreDataService(client = supabase, { writesEnabled = supabaseWritesEnabled, isSelected = supabaseSelected } = {}) {
  let lastSnapshot = null;
  return {
    mode: 'Supabase (configured project)', isLocalOnly: false, isRemote: true, canWrite: writesEnabled,
    async read() {
      if (!client) throw new Error('Supabase client is not configured.');
      // Resolve the persisted session before PostgREST queries so an authorized
      // staff refresh gets the staff RLS view, including draft records.
      const { error: authError } = await client.auth.getSession();
      if (authError) throw authError;
      const [productsResult, collectionsResult, membershipsResult, homepageResult, settingsResult] = await Promise.all([
        client.from('products').select('*').order('name'),
        client.from('collections').select(collectionColumns).order('position'),
        client.from('product_collections').select('product_id,collection_id'),
        client.from('homepage_content').select('content').eq('id', 'storefront').maybeSingle(),
        client.from('store_settings').select('*').eq('id', 'storefront').maybeSingle(),
      ]);
      const productRows = throwOnError(productsResult) || [];
      const collectionRows = throwOnError(collectionsResult) || [];
      const memberships = throwOnError(membershipsResult) || [];
      const content = throwOnError(homepageResult)?.content;
      const settingRow = throwOnError(settingsResult);
      const products = await Promise.all(productRows.map((row) => fromProduct(client, row, memberships.filter((entry) => entry.product_id === row.id).map((entry) => entry.collection_id))));
      const collections = await Promise.all(collectionRows.map(async (row) => ({ id: row.id, title: row.title, description: row.description || '', image: await resolveImage(client, row.image_url || ''), displayStatus: row.display_status, featuredOnHomepage: row.featured_on_homepage })));
      const emptyHomepage = { announcementText: '', heroHeading: '', heroEmphasis: '', heroSubtitle: '', heroImageUrl: '', heroCtaText: '', heroCtaLink: '#/', featuredCollectionIds: [], featuredProductIds: [], newArrivalProductIds: [], sections: { hero: false, commitments: false, collections: false, arrivals: false, story: false, featured: false, quote: false, newsletter: false } };
      const homepage = { ...emptyHomepage, ...(content || {}), sections: { ...emptyHomepage.sections, ...(content?.sections || {}) } };
      homepage.heroImageUrl = await resolveImage(client, homepage.heroImageUrl);
      const settings = settingRow ? {
        storeName: settingRow.store_name, contactEmail: settingRow.contact_email || '', contactPhone: settingRow.contact_phone || '',
        instagramUrl: settingRow.instagram_url || '', facebookUrl: settingRow.facebook_url || '', currency: settingRow.currency || 'CAD',
      } : { storeName: 'Store', contactEmail: '', contactPhone: '', instagramUrl: '', facebookUrl: '', currency: 'CAD' };
      lastSnapshot = { version: 1, products, collections, homepage, settings };
      return structuredClone(lastSnapshot);
    },
  async save(next) {
      if (!client || !isSelected) return { ok: false, error: 'Supabase is not selected. Local preview remains active.' };
      if (!writesEnabled) return { ok: false, error: 'Supabase is read-only in this setup. Verify the migration, staff authentication, and RLS policies before explicitly enabling writes.' };
      if (!lastSnapshot) return { ok: false, error: 'Load the Supabase data before saving to avoid copying preview data into the project.' };
      try {
        const { data: sessionResult, error: sessionError } = await client.auth.getSession();
        if (sessionError) throw sessionError;
        if (!sessionResult.session) return { ok: false, error: 'Sign in with an authorized staff account before saving.' };
        const { data: staffRole, error: roleError } = await client.from('staff_roles').select('role').eq('user_id', sessionResult.session.user.id).maybeSingle();
        if (roleError) throw roleError;
        if (!staffRole) return { ok: false, error: 'This account is not assigned an authorized store staff role.' };

        const payloadProducts = next.products.map((item) => ({ ...toProduct(item), collection_ids: item.collectionIds || [] }));
        const payloadCollections = next.collections.map(toCollection);
        throwOnError(await client.rpc('save_store_snapshot', {
          p_products: payloadProducts,
          p_collections: payloadCollections,
          p_homepage: { ...next.homepage, heroImageUrl: toImageReference(next.homepage.heroImageUrl || '') },
          p_settings: {
            store_name: next.settings.storeName, contact_email: next.settings.contactEmail || null,
            contact_phone: next.settings.contactPhone || null, instagram_url: next.settings.instagramUrl || null,
            facebook_url: next.settings.facebookUrl || null, currency: next.settings.currency || 'CAD',
          },
        }));
        lastSnapshot = structuredClone(next);
        return { ok: true };
      } catch (error) {
        return { ok: false, error: error?.message || 'Supabase rejected the save. Confirm staff role and database policies.' };
      }
    },
  };
}
