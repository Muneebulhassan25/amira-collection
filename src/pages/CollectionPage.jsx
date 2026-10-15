import { categories, formatCategory, products } from '../data/products.js';
import ProductCard from '../components/ui/ProductCard.jsx';
import { getCatalogProducts } from '../utils/catalog.js';

export default function CollectionPage({ route }) {
  const category = categories.some((item) => item.id === route.category) ? route.category : 'all';
  const sorted = getCatalogProducts(products, { category, query: route.query, sort: route.sort });
  function changeSort(event) {
    const params = new URLSearchParams();
    if (category !== 'all') params.set('category', category);
    if (route.query) params.set('q', route.query);
    if (event.target.value !== 'featured') params.set('sort', event.target.value);
    window.location.hash = `/collections${params.size ? `?${params}` : ''}`;
  }
  return <div className="collection-page">
    <div className="collection-hero"><div><p className="eyebrow">A considered edit</p><h1>{route.query ? `Search results for “${route.query}”` : category === 'all' ? 'The collection' : formatCategory(category)}</h1><p>Easy pieces, considered details, and a little something for every kind of day.</p></div><span className="collection-meta">STUDIO EDIT · 2026</span></div>
    <div className="catalog-wrap">
      <div className="catalog-toolbar"><nav className="filter-tabs" aria-label="Filter by category">{categories.map((item) => <a key={item.id} aria-current={category === item.id ? 'page' : undefined} href={item.id === 'all' ? '#/collections' : `#/collections?category=${item.id}`}>{item.name}</a>)}</nav><label className="sort-control"><span>Sort by</span><select value={route.sort} onChange={changeSort} aria-label="Sort products"><option value="featured">Featured</option><option value="newest">Newest</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select></label></div>
      <div className="results-line"><span>{sorted.length} considered {sorted.length === 1 ? 'piece' : 'pieces'}</span>{route.query && <a href={category === 'all' ? '#/collections' : `#/collections?category=${category}`}>Clear search ×</a>}</div>
      {sorted.length ? <div className="product-grid catalog-grid">{sorted.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty-results"><span className="empty-mark">✳</span><h2>No pieces found just yet</h2><p>Try a different search or browse the full studio edit.</p><a className="button button-dark" href="#/collections">Shop all pieces</a></div>}
    </div>
  </div>;
}
