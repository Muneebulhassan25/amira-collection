import { formatCategory } from '../data/products.js';
import { useStoreData } from '../context/StoreDataContext.jsx';
import ProductCard from '../components/ui/ProductCard.jsx';
import { getCatalogProducts } from '../utils/catalog.js';
import { collectionHref } from '../utils/router.js';

export default function CollectionPage({ route }) {
  const store = useStoreData();
  const category = route.category || 'all';
  const collection = store.collections.find((item) => item.id === category);
  const collectionUnavailable = category !== 'all' && collection?.displayStatus === 'draft';
  const sorted = getCatalogProducts(store.products.filter((item) => item.status !== 'draft'), { category, query: route.query, sort: route.sort });
  function changeSort(event) {
    const params = new URLSearchParams();
    if (route.query) params.set('q', route.query);
    if (event.target.value !== 'featured') params.set('sort', event.target.value);
    const path = category === 'all' ? '/collections' : `/collections/${encodeURIComponent(category)}`;
    window.location.hash = `${path}${params.size ? `?${params}` : ''}`;
  }
  const collectionTitle = route.query ? `Search results for “${route.query}”` : category === 'all' ? 'Search results' : formatCategory(category, store.collections);
  const sortOptions = [
    ['featured', 'Featured / Most Relevant'],
    ['best-selling', 'Best Selling'],
    ['az', 'Alphabetically, A–Z'],
    ['za', 'Alphabetically, Z–A'],
    ['price-asc', 'Price, Low to High'],
    ['price-desc', 'Price, High to Low'],
    ['date-desc', 'Date, New to Old'],
    ['date-asc', 'Date, Old to New'],
  ];
  return <div className="collection-page">
    <div className="collection-hero"><div><p className="eyebrow">A considered edit</p><h1>{collectionTitle}</h1><p>{collection?.description || 'Easy pieces, considered details, and a little something for every kind of day.'}</p></div><span className="collection-meta">STUDIO EDIT · 2026</span></div>
    <div className="catalog-wrap">
      <div className="catalog-toolbar"><span className="catalog-context">{category === 'new-arrivals' ? 'JUST ARRIVED' : category === 'all' ? 'THE STUDIO EDIT' : formatCategory(category).toUpperCase()}</span><label className="sort-control"><span>Sort by</span><select value={route.sort === 'newest' ? 'date-desc' : route.sort} onChange={changeSort} aria-label="Sort products">{sortOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div>
      <div className="results-line"><span>{sorted.length} considered {sorted.length === 1 ? 'piece' : 'pieces'}</span>{route.query && <a href={collectionHref(category)}>Clear search ×</a>}</div>
      {collectionUnavailable ? <div className="empty-results"><span className="empty-mark">✳</span><h2>This collection is not available yet</h2><p>It is hidden while the studio prepares this edit.</p><a className="button button-dark" href={collectionHref('new-arrivals')}>Explore New Arrivals</a></div> : sorted.length ? <div className="product-grid catalog-grid">{sorted.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty-results"><span className="empty-mark">✳</span><h2>No pieces found just yet</h2><p>Try a different search or browse New Arrivals.</p><a className="button button-dark" href={collectionHref('new-arrivals')}>Explore New Arrivals</a></div>}
    </div>
  </div>;
}
