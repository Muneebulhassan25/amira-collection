import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRoute } from '../src/utils/router.js';
import { addCartItem, getCartCount, getCartSubtotal, removeCartItem, setCartItemQuantity } from '../src/utils/cart.js';
import { getCatalogProducts } from '../src/utils/catalog.js';
import { products } from '../src/data/products.js';

test('routes home, category, search, product, and cart links', () => {
  assert.deepEqual(parseRoute(''), { page: 'home' });
  assert.deepEqual(parseRoute('#/collections?category=abayas&sort=price-asc'), { page: 'collection', category: 'abayas', query: '', sort: 'price-asc' });
  assert.deepEqual(parseRoute('#/collections?q=soft%20scarf'), { page: 'collection', category: 'all', query: 'soft scarf', sort: 'featured' });
  assert.deepEqual(parseRoute('#/product/mira-soft-scarf'), { page: 'product', id: 'mira-soft-scarf' });
  assert.deepEqual(parseRoute('#/cart'), { page: 'cart' });
});

test('catalog filters by category and search, then sorts by price', () => {
  const results = getCatalogProducts(products, { category: 'scarves', query: 'soft', sort: 'price-desc' });
  assert.deepEqual(results.map((product) => product.id), ['sama-texture-scarf', 'mira-soft-scarf']);
  const dresses = getCatalogProducts(products, { category: 'dresses', sort: 'price-asc' });
  assert.equal(dresses.length, 4);
  assert.ok(dresses[0].price <= dresses.at(-1).price);
  assert.equal(getCatalogProducts(products, { sort: 'newest' })[0].id, products[0].id);
  assert.deepEqual(getCatalogProducts(products, { query: 'no match' }), []);
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
