export function getCatalogProducts(products, { category = 'all', query = '', sort = 'featured' } = {}) {
  const filtered = products.filter((product) => (category === 'all' || product.category === category) && `${product.name} ${product.color} ${product.description}`.toLowerCase().includes(query.toLowerCase()));
  if (sort === 'price-asc') return filtered.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') return filtered.sort((a, b) => b.price - a.price);
  if (sort === 'newest') return filtered;
  return filtered;
}
