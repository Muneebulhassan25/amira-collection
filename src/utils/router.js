export function parseRoute(hash = '') {
  const raw = hash.replace(/^#/, '') || '/';
  const [path, query = ''] = raw.split('?');
  const params = new URLSearchParams(query);
  if (path.startsWith('/product/')) return { page: 'product', id: path.slice('/product/'.length) };
  if (path === '/collections' || path.startsWith('/collections/')) return { page: 'collection', category: params.get('category') || path.split('/')[2] || 'all', query: params.get('q') || '', sort: params.get('sort') || 'featured' };
  if (path === '/cart') return { page: 'cart' };
  return { page: 'home' };
}

export function collectionHref(category = 'all') {
  return category === 'all' ? '#/collections' : `#/collections?category=${encodeURIComponent(category)}`;
}
