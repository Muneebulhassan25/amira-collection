import { hasValidSalePrice } from './catalog.js';

export function slugifyProductName(name) {
  return String(name || '').trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function validateProductDraft(draft, { isNew = false, existingProducts = [] } = {}) {
  const errors = {};
  if (!String(draft.name || '').trim()) errors.name = 'Enter a product name.';
  if (!String(draft.description || '').trim()) errors.description = 'Enter a product description.';
  const price = Number(draft.price);
  if (draft.price === '' || !Number.isFinite(price) || price < 0) errors.price = 'Enter a valid price of zero or more.';
  const compareAt = draft.compareAt === '' || draft.compareAt == null ? null : Number(draft.compareAt);
  if (compareAt !== null && (!Number.isFinite(compareAt) || compareAt <= price)) errors.compareAt = 'Compare-at price must be greater than the current price.';
  if (!String(draft.category || '').trim()) errors.category = 'Choose a product category.';
  if (!String(draft.sku || '').trim()) errors.sku = 'Enter a SKU.';
  if (existingProducts.some((item) => item.sku && item.sku.toLowerCase() === String(draft.sku || '').trim().toLowerCase() && item.id !== draft.id)) errors.sku = 'That SKU is already in use.';
  const quantity = draft.inventoryQuantity === '' || draft.inventoryQuantity == null ? null : Number(draft.inventoryQuantity);
  if ((isNew && quantity === null) || (quantity !== null && (!Number.isInteger(quantity) || quantity < 0))) errors.inventoryQuantity = 'Enter a whole stock quantity of zero or more.';
  if (!Array.isArray(draft.images) || !draft.images.length || draft.images.some((url) => !/^https?:\/\//i.test(String(url).trim()))) errors.images = 'Add at least one valid image URL beginning with http:// or https://.';
  const mainImageIndex = Number(draft.mainImageIndex);
  if (!Number.isInteger(mainImageIndex) || mainImageIndex < 0 || mainImageIndex >= (draft.images?.length || 0)) errors.mainImageIndex = 'Choose a main image.';
  if (!['published', 'draft'].includes(draft.status)) errors.status = 'Choose whether this product is a draft or published.';
  return errors;
}

export function saveProductToData(data, product) {
  const exists = data.products.some((item) => item.id === product.id);
  const products = exists ? data.products.map((item) => item.id === product.id ? { ...product } : item) : [...data.products, { ...product }];
  return { ...data, products };
}

export function deleteProductFromData(data, productId) {
  return {
    ...data,
    products: data.products.filter((item) => item.id !== productId),
    homepage: {
      ...data.homepage,
      featuredProductIds: data.homepage.featuredProductIds.filter((id) => id !== productId),
      newArrivalProductIds: data.homepage.newArrivalProductIds.filter((id) => id !== productId),
    },
  };
}

export function assignProductToCollection(product, collectionId, assigned) {
  if (collectionId === 'new-arrivals') {
    return { ...product, isNewArrival: assigned, label: assigned ? 'New arrival' : (product.label === 'New arrival' ? '' : product.label) };
  }
  if (collectionId === 'sale') return { ...product, onSale: assigned };
  const memberships = new Set(product.collectionIds || []);
  if (assigned) memberships.add(collectionId); else memberships.delete(collectionId);
  return { ...product, collectionIds: [...memberships] };
}

export function syncFeaturedProducts(products, featuredProductIds) {
  const selected = new Set(featuredProductIds);
  return products.map((product) => ({ ...product, featured: selected.has(product.id) }));
}

export function isProductSaleEligible(product) { return hasValidSalePrice(product); }
