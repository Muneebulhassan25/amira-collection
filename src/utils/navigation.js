export function getActiveNavKey(route, product) {
  if (route.page === 'home') return 'home';
  if (route.page === 'collection') return route.category || 'all';
  if (route.page === 'product') return product?.category || null;
  return null;
}
