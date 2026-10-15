import { collectionHref } from '../utils/router.js';

export const primaryNavItems = [
  { label: 'Home', href: '#/', key: 'home' },
  { label: 'New arrivals', href: collectionHref('new-arrivals'), key: 'new-arrivals' },
  { label: 'Dresses', href: collectionHref('dresses'), key: 'dresses' },
  { label: 'Abayas', href: collectionHref('abayas'), key: 'abayas' },
  { label: 'Matching sets', href: collectionHref('sets'), key: 'sets' },
  { label: 'Scarves', href: collectionHref('scarves'), key: 'scarves' },
  { label: 'Swimwear', href: collectionHref('swimwear'), key: 'swimwear' },
  { label: 'Winter Collection', href: collectionHref('winter-collection'), key: 'winter-collection' },
  { label: 'Gift Items', href: collectionHref('gift-items'), key: 'gift-items' },
  { label: 'SALE', href: collectionHref('sale'), key: 'sale', className: 'sale-nav-link' },
];

const moreCollectionKeys = new Set(['swimwear', 'winter-collection', 'gift-items']);

export const desktopNavItems = primaryNavItems.filter((item) => !moreCollectionKeys.has(item.key));
export const moreNavItems = primaryNavItems.filter((item) => moreCollectionKeys.has(item.key));
