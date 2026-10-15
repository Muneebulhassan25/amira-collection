import { useCart } from '../../context/CartContext.jsx';

const navItems = [['New arrivals', '#/collections?sort=newest'], ['Shop all', '#/collections'], ['Dresses', '#/collections?category=dresses'], ['Abayas', '#/collections?category=abayas'], ['Matching sets', '#/collections?category=sets'], ['Scarves', '#/collections?category=scarves']];

export default function SiteHeader() {
  const { items } = useCart();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  function submitSearch(event) {
    event.preventDefault();
    const query = new FormData(event.currentTarget).get('q')?.toString().trim();
    if (query) window.location.hash = `/collections?q=${encodeURIComponent(query)}`;
  }
  return <header className="site-header">
    <div className="header-main">
      <a className="brand" href="#/" aria-label="Atelier Nisa home">atelier <span>nisa</span></a>
      <form className="header-search" role="search" onSubmit={submitSearch}>
        <label className="sr-only" htmlFor="site-search">Search the collection</label>
        <input id="site-search" name="q" type="search" placeholder="Search the collection" />
        <button type="submit" aria-label="Search"><span aria-hidden="true">⌕</span></button>
      </form>
      <a className="cart-link" href="#/cart" aria-label={`Shopping bag, ${count} items`}><span className="bag-icon" aria-hidden="true">♧</span><span className="cart-label">Bag</span><span className="cart-count">{count}</span></a>
    </div>
    <nav className="main-nav" aria-label="Main navigation">{navItems.map(([name, href]) => <a key={name} href={href}>{name}</a>)}<a className="sale-link" href="#/collections?sort=price-asc">Price: low to high</a></nav>
  </header>;
}
