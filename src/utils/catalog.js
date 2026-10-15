export function hasValidSalePrice(product) {
  if (product.onSale === true) return true;
  const price = Number(product.price);
  const compareAt = Number(product.compareAt);
  return Number.isFinite(price) && price >= 0 && Number.isFinite(compareAt) && compareAt > price;
}

export function getCatalogProducts(products, { category = 'all', query = '', sort = 'featured' } = {}) {
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = products.filter((product) => {
    const inCategory = category === 'all'
      || (category === 'new-arrivals' && product.isNewArrival === true)
      || (category === 'sale' && hasValidSalePrice(product))
      || (category !== 'new-arrivals' && category !== 'sale' && (product.category === category || product.collectionIds?.includes(category)));
    const searchable = `${product.name || ''} ${product.color || ''} ${product.description || ''}`.toLowerCase();
    return inCategory && searchable.includes(normalizedQuery);
  });
  const dateValue = (product) => {
    const date = Date.parse(product.arrivalDate || '');
    return Number.isNaN(date) ? 0 : date;
  };
  const comparators = {
    featured: (a, b) => (a.relevanceRank ?? Number.MAX_SAFE_INTEGER) - (b.relevanceRank ?? Number.MAX_SAFE_INTEGER),
    'best-selling': (a, b) => (a.bestSellerRank ?? Number.MAX_SAFE_INTEGER) - (b.bestSellerRank ?? Number.MAX_SAFE_INTEGER),
    az: (a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }),
    za: (a, b) => (b.name || '').localeCompare(a.name || '', undefined, { sensitivity: 'base' }),
    'price-asc': (a, b) => (Number(a.price) || 0) - (Number(b.price) || 0),
    'price-desc': (a, b) => (Number(b.price) || 0) - (Number(a.price) || 0),
    'date-desc': (a, b) => dateValue(b) - dateValue(a),
    'date-asc': (a, b) => dateValue(a) - dateValue(b),
    newest: (a, b) => dateValue(b) - dateValue(a),
  };
  const compare = comparators[sort] || comparators.featured;
  return filtered.map((product, index) => ({ product, index }))
    .sort((a, b) => compare(a.product, b.product) || a.index - b.index)
    .map(({ product }) => product);
}
