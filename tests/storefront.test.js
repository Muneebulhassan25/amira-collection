import test from 'node:test';
import assert from 'node:assert/strict';
import { collectionHref, parseRoute } from '../src/utils/router.js';
import { getActiveNavKey } from '../src/utils/navigation.js';
import { addCartItem, getCartCount, getCartSubtotal, removeCartItem, setCartItemQuantity } from '../src/utils/cart.js';
import { getCatalogProducts, hasValidSalePrice } from '../src/utils/catalog.js';
import { mobileMenuReducer } from '../src/utils/mobileMenu.js';
import { products } from '../src/data/products.js';
import { desktopNavItems, moreNavItems, primaryNavItems } from '../src/data/navigation.js';

test('routes home, category, search, product, and cart links', () => {
  assert.deepEqual(parseRoute(''), { page: 'home' });
  assert.deepEqual(parseRoute('#/collections?category=abayas&sort=price-asc'), { page: 'collection', category: 'abayas', query: '', sort: 'price-asc' });
  assert.deepEqual(parseRoute('#/collections/new-arrivals?sort=date-desc'), { page: 'collection', category: 'new-arrivals', query: '', sort: 'date-desc' });
  for (const category of ['swimwear', 'winter-collection', 'gift-items', 'sale']) {
    assert.deepEqual(parseRoute(`#/collections/${category}`), { page: 'collection', category, query: '', sort: 'featured' });
    assert.equal(collectionHref(category), `#/collections/${category}`);
  }
  assert.deepEqual(parseRoute('#/collections'), { page: 'home' });
  assert.deepEqual(parseRoute('#/collections?q=soft%20scarf'), { page: 'collection', category: 'all', query: 'soft scarf', sort: 'featured' });
  assert.deepEqual(parseRoute('#/product/mira-soft-scarf'), { page: 'product', id: 'mira-soft-scarf' });
  assert.deepEqual(parseRoute('#/cart'), { page: 'cart' });
});

test('active navigation follows home, collections, product category, and direct routes', () => {
  assert.equal(getActiveNavKey(parseRoute('#/')), 'home');
  assert.equal(getActiveNavKey(parseRoute('#/collections?category=new-arrivals')), 'new-arrivals');
  assert.equal(getActiveNavKey(parseRoute('#/collections')), 'home');
  assert.equal(getActiveNavKey(parseRoute('#/collections?category=sets')), 'sets');
  for (const category of ['swimwear', 'winter-collection', 'gift-items', 'sale']) {
    assert.equal(getActiveNavKey(parseRoute(`#/collections/${category}`)), category);
  }
  assert.equal(getActiveNavKey(parseRoute('#/product/mira-soft-scarf'), products.find((item) => item.id === 'mira-soft-scarf')), 'scarves');
  assert.equal(getActiveNavKey(parseRoute('#/cart')), null);
});

test('primary desktop and mobile navigation omit Shop All and link to each collection', () => {
  const keys = primaryNavItems.map((item) => item.key);
  assert.equal(primaryNavItems.some((item) => item.label.toLowerCase() === 'shop all'), false);
  assert.equal(keys.includes('all'), false);
  assert.deepEqual(keys, ['home', 'new-arrivals', 'dresses', 'abayas', 'sets', 'scarves', 'swimwear', 'winter-collection', 'gift-items', 'sale']);
  assert.deepEqual(moreNavItems.map((item) => item.key), ['swimwear', 'winter-collection', 'gift-items']);
  assert.equal(desktopNavItems.some((item) => item.key === 'sale'), true);
  assert.equal(desktopNavItems.some((item) => item.key === 'all'), false);
  assert.equal(primaryNavItems.find((item) => item.key === 'sale')?.className, 'sale-nav-link');
  for (const category of ['swimwear', 'winter-collection', 'gift-items', 'sale']) {
    assert.equal(primaryNavItems.find((item) => item.key === category)?.href, `#/collections/${category}`);
  }
});

test('mobile menu toggles repeatedly, closes on selection, and handles Escape', () => {
  assert.equal(mobileMenuReducer(false, { type: 'toggle' }), true);
  assert.equal(mobileMenuReducer(true, { type: 'toggle' }), false);
  assert.equal(mobileMenuReducer(true, { type: 'close' }), false);
  assert.equal(mobileMenuReducer(true, { type: 'escape' }), false);
  assert.equal(mobileMenuReducer(true, { type: 'unrelated' }), true);
});

test('catalog filters by category and search, then sorts by price', () => {
  const results = getCatalogProducts(products, { category: 'scarves', query: 'soft', sort: 'price-desc' });
  assert.deepEqual(results.map((product) => product.id), ['sama-texture-scarf', 'mira-soft-scarf']);
  const dresses = getCatalogProducts(products, { category: 'dresses', sort: 'price-asc' });
  assert.equal(dresses.length, 4);
  assert.ok(dresses[0].price <= dresses.at(-1).price);
  assert.equal(getCatalogProducts(products, { sort: 'newest' })[0].id, 'sama-texture-scarf');
  assert.deepEqual(getCatalogProducts(products, { category: 'new-arrivals', sort: 'date-desc' }).map((product) => product.id), ['sama-texture-scarf', 'hana-linen-coord', 'sahar-evening-dress']);
  assert.deepEqual(getCatalogProducts(products, { category: 'swimwear' }), []);
  assert.deepEqual(getCatalogProducts(products, { category: 'winter-collection' }).map((product) => product.id), ['noor-knit-set']);
  assert.deepEqual(getCatalogProducts(products, { category: 'gift-items' }).map((product) => product.id), ['mira-soft-scarf', 'sama-texture-scarf']);
  assert.deepEqual(getCatalogProducts(products, { category: 'sale' }).map((product) => product.id), ['sahar-evening-dress']);
  const explicitlyMarkedSale = { id: 'preview-sale', name: 'Preview sale', category: 'dresses', price: 50, onSale: true };
  assert.equal(getCatalogProducts([...products, explicitlyMarkedSale], { category: 'sale' }).some((product) => product.id === 'preview-sale'), true);
  assert.equal(hasValidSalePrice({ price: 10, compareAt: 9 }), false);
  assert.equal(hasValidSalePrice({ price: 10, compareAt: 10 }), false);
  assert.equal(hasValidSalePrice({ price: 10, onSale: true }), true);
  assert.deepEqual(getCatalogProducts(products, { query: 'no match' }), []);
});

test('all collection sort options reorder safely without mutating the shared catalog', () => {
  const originalOrder = products.map((product) => product.id);
  const expectedSorts = {
    featured: 'sahar-evening-dress',
    'best-selling': 'sahar-evening-dress',
    az: 'Amira Satin Maxi',
    za: 'Zara Occasion Gown',
    'price-asc': 'sahar-evening-dress',
    'price-desc': 'zara-occasion-gown',
    'date-desc': 'sahar-evening-dress',
    'date-asc': 'nour-pleated-dress',
  };
  for (const [sort, first] of Object.entries(expectedSorts)) {
    const firstProduct = getCatalogProducts(products, { category: 'dresses', sort })[0];
    assert.ok(firstProduct.category === 'dresses', `${sort} remains within the selected category`);
    assert.equal(sort === 'az' || sort === 'za' ? firstProduct.name : firstProduct.id, first, `${sort} uses the expected order`);
  }
  assert.deepEqual(products.map((product) => product.id), originalOrder);
  const missingOptionalData = [{ id: 'missing', name: 'Missing fields', category: 'dresses', price: 10 }, { id: 'dated', name: 'Dated', category: 'dresses', price: 20, arrivalDate: '2026-01-01' }];
  assert.deepEqual(getCatalogProducts(missingOptionalData, { sort: 'date-desc' }).map((product) => product.id), ['dated', 'missing']);
});

test('cart combines matching variants, tracks totals, updates quantities, and removes lines', () => {
  let items = addCartItem([], 'mira-soft-scarf', { size: 'One size', color: 'Clay' });
  items = addCartItem(items, 'mira-soft-scarf', { size: 'One size', color: 'Clay', quantity: 2 });
  items = addCartItem(items, 'mira-soft-scarf', { size: 'One size', color: 'Olive' });
  assert.equal(getCartCount(items), 4);
  assert.equal(items.length, 2);
  assert.equal(getCartSubtotal(items, (id) => id === 'mira-soft-scarf' ? { price: 38 } : null), 152);
  items = setCartItemQuantity(items, 'mira-soft-scarf', 'One size', 'Clay', 1);
  assert.equal(getCartCount(items), 2);
  items = removeCartItem(items, 'mira-soft-scarf', 'One size', 'Clay');
  assert.equal(getCartCount(items), 1);
  items = setCartItemQuantity(items, 'mira-soft-scarf', 'One size', 'Olive', 0);
  assert.equal(items.length, 0);
});
