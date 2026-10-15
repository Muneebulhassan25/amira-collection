import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRoute } from '../src/utils/router.js';
import { createDefaultStoreData } from '../src/data/storeDefaults.js';
import { createDemoStoreDataService, STORE_DATA_STORAGE_KEY } from '../src/services/storeDataService.js';
import { adminAuthService } from '../src/services/adminAuthService.js';
import { assignProductToCollection, deleteProductFromData, isProductSaleEligible, saveProductToData, slugifyProductName, syncFeaturedProducts, validateProductDraft } from '../src/utils/adminProducts.js';

function validDraft() {
  return { name: 'New Modest Dress', description: 'A placeholder description for a preview item.', price: 100, compareAt: 140, category: 'dresses', sku: 'TN-NEW-01', inventoryQuantity: 4, images: ['https://example.com/dress.jpg'], mainImageIndex: 0, status: 'published' };
}

test('admin hash routes resolve to preview access and each dashboard section', () => {
  assert.deepEqual(parseRoute('#/admin/login'), { page: 'admin-login' });
  assert.deepEqual(parseRoute('#/admin'), { page: 'admin', section: 'dashboard' });
  for (const section of ['products', 'collections', 'homepage', 'orders', 'settings']) assert.deepEqual(parseRoute(`#/admin/${section}`), { page: 'admin', section });
});

test('preview authentication reports unsupported sign-in without accepting credentials', async () => {
  assert.deepEqual(adminAuthService.getStatus(), { configured: false, authenticated: false, mode: 'preview-only' });
  const result = await adminAuthService.signIn({ email: 'someone@example.com', password: 'anything' });
  assert.equal(result.ok, false);
  assert.match(result.error, /not configured/i);
});

test('product validation accepts a valid item and reports required, numeric, SKU, image, and sale errors', () => {
  const errors = validateProductDraft(validDraft(), { isNew: true, existingProducts: [] });
  assert.deepEqual(errors, {});
  assert.equal(slugifyProductName('  Noor Knit Set  '), 'noor-knit-set');
  const invalid = validateProductDraft({ ...validDraft(), name: ' ', price: -1, compareAt: -2, sku: '', inventoryQuantity: 1.5, images: ['not-a-url'], mainImageIndex: 4 }, { isNew: true, existingProducts: [] });
  for (const field of ['name', 'price', 'compareAt', 'sku', 'inventoryQuantity', 'images', 'mainImageIndex']) assert.ok(invalid[field], `${field} should be validated`);
  assert.ok(validateProductDraft(validDraft(), { isNew: true, existingProducts: [{ id: 'existing', sku: 'tn-new-01' }] }).sku);
});

test('preview product CRUD keeps the catalog model and homepage references consistent', () => {
  const seed = createDefaultStoreData();
  const product = { ...validDraft(), id: 'new-modest-dress', images: ['https://example.com/dress.jpg'], image: 'https://example.com/dress.jpg', sizes: ['S', 'M'], colors: ['Olive'], collectionIds: ['dresses'], isNewArrival: true };
  let data = saveProductToData(seed, product);
  assert.equal(data.products.find((item) => item.id === product.id).price, 100);
  data.homepage.featuredProductIds = [...data.homepage.featuredProductIds, product.id];
  data.homepage.newArrivalProductIds = [...data.homepage.newArrivalProductIds, product.id];
  data = saveProductToData(data, { ...product, price: 95 });
  assert.equal(data.products.find((item) => item.id === product.id).price, 95);
  data = deleteProductFromData(data, product.id);
  assert.equal(data.products.some((item) => item.id === product.id), false);
  assert.equal(data.homepage.featuredProductIds.includes(product.id), false);
  assert.equal(data.homepage.newArrivalProductIds.includes(product.id), false);
});

test('collection assignment updates membership and sale eligibility stays explicit', () => {
  const product = { id: 'preview-item', price: 60, compareAt: undefined, collectionIds: [] };
  const winter = assignProductToCollection(product, 'winter-collection', true);
  assert.deepEqual(winter.collectionIds, ['winter-collection']);
  assert.deepEqual(assignProductToCollection(winter, 'winter-collection', false).collectionIds, []);
  const marked = assignProductToCollection(product, 'sale', true);
  assert.equal(marked.onSale, true);
  assert.equal(isProductSaleEligible(marked), true);
  assert.equal(isProductSaleEligible({ ...product, compareAt: 55 }), false);
  assert.equal(isProductSaleEligible({ ...product, compareAt: 75 }), true);
});

test('homepage featured product selections stay in sync with product featured flags', () => {
  const items = [{ id: 'first', featured: true }, { id: 'second', featured: true }];
  assert.deepEqual(syncFeaturedProducts(items, ['second']), [{ id: 'first', featured: false }, { id: 'second', featured: true }]);
});

test('demo data service persists only through its injected local storage adapter', () => {
  const memory = new Map();
  const storage = { getItem: (key) => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value) };
  const service = createDemoStoreDataService(storage);
  const data = service.read();
  data.settings.storeName = 'Preview House';
  assert.deepEqual(service.save(data), { ok: true });
  assert.equal(JSON.parse(memory.get(STORE_DATA_STORAGE_KEY)).settings.storeName, 'Preview House');
  assert.equal(service.read().settings.storeName, 'Preview House');
  assert.equal(service.isLocalOnly, true);
});

test('rebrand updates the previous default name in local preview without replacing custom store names', () => {
  const legacy = createDefaultStoreData();
  legacy.settings.storeName = 'Atelier Nisa';
  const stored = new Map([[STORE_DATA_STORAGE_KEY, JSON.stringify(legacy)]]);
  const storage = { getItem: (key) => stored.get(key) ?? null, setItem: (key, value) => stored.set(key, value) };
  assert.equal(createDemoStoreDataService(storage).read().settings.storeName, 'AMIRA Collection');
  legacy.settings.storeName = 'Client Boutique';
  stored.set(STORE_DATA_STORAGE_KEY, JSON.stringify(legacy));
  assert.equal(createDemoStoreDataService(storage).read().settings.storeName, 'Client Boutique');
});
