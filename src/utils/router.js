export function parseRoute(hash = '') {
  const raw = hash.replace(/^#/, '') || '/';
  const [path, query = ''] = raw.split('?');
  const params = new URLSearchParams(query);
  if (path === '/admin/login') return { page: 'admin-login' };
  if (path === '/admin' || path.startsWith('/admin/')) return { page: 'admin', section: path.split('/')[2] || 'dashboard' };
  if (path.startsWith('/product/')) return { page: 'product', id: path.slice('/product/'.length) };
  if (path === '/collections' && !params.has('q') && (!params.has('category') || params.get('category') === 'all')) return { page: 'home' };
  if (path === '/collections' || path.startsWith('/collections/')) return { page: 'collection', category: params.get('category') || path.split('/')[2] || 'all', query: params.get('q') || '', sort: params.get('sort') || 'featured' };
  if (path === '/cart') return { page: 'cart' };
  return { page: 'home' };
}

export function collectionHref(category = 'all') {
  if (category === 'all') return '#/collections/new-arrivals?sort=date-desc';
  if (category === 'new-arrivals') return '#/collections/new-arrivals?sort=date-desc';
  return `#/collections/${encodeURIComponent(category)}`;
}
