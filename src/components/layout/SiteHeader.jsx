import { useEffect, useReducer, useRef } from 'react';
import { useCart } from '../../context/CartContext.jsx';
import { parseRoute } from '../../utils/router.js';
import { useStoreData } from '../../context/StoreDataContext.jsx';
import { desktopNavItems, moreNavItems, primaryNavItems } from '../../data/navigation.js';
import { getActiveNavKey } from '../../utils/navigation.js';
import { mobileMenuReducer } from '../../utils/mobileMenu.js';

export default function SiteHeader() {
  const { items } = useCart();
  const { products, collections, settings } = useStoreData();
  const [mobileMenuOpen, dispatchMobileMenu] = useReducer(mobileMenuReducer, false);
  const menuButtonRef = useRef(null);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const route = parseRoute(window.location.hash);
  const activeNavKey = getActiveNavKey(route, route.page === 'product' ? products.find((item) => item.id === route.id) : undefined);
  const visibleNavItems = primaryNavItems.filter((item) => item.key === 'home' || collections.find((collection) => collection.id === item.key)?.displayStatus !== 'draft');
  const visibleDesktopItems = desktopNavItems.filter((item) => visibleNavItems.some((visible) => visible.key === item.key));
  const visibleMoreItems = moreNavItems.filter((item) => visibleNavItems.some((visible) => visible.key === item.key));
  const moreIsActive = visibleMoreItems.some((item) => item.key === activeNavKey);
  const navLabel = (item) => collections.find((collection) => collection.id === item.key)?.title || item.label;
  const brandParts = settings.storeName.trim().split(/\s+/);
  const brandFirst = brandParts.shift() || settings.storeName;
  const brandRest = brandParts.join(' ');
  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        dispatchMobileMenu({ type: 'escape' });
        menuButtonRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen]);
  function submitSearch(event) {
    event.preventDefault();
    const query = new FormData(event.currentTarget).get('q')?.toString().trim();
    if (query) window.location.hash = `/collections?q=${encodeURIComponent(query)}`;
  }
  return <header className="site-header">
    <div className="header-main">
      <a className="brand" href="#/" aria-label={`${settings.storeName} home`}>{brandFirst} {brandRest && <span>{brandRest}</span>}</a>
      <form className="header-search" role="search" onSubmit={submitSearch}>
        <label className="sr-only" htmlFor="site-search">Search the collection</label>
        <input id="site-search" name="q" type="search" placeholder="Search the collection" />
        <button type="submit" aria-label="Search"><span aria-hidden="true">⌕</span></button>
      </form>
      <div className="header-actions">
        <a className="cart-link" href="#/cart" aria-label={`Shopping bag, ${count} items`}><span className="bag-icon" aria-hidden="true">♧</span><span className="cart-label">Bag</span><span className="cart-count">{count}</span></a>
        <button ref={menuButtonRef} className="mobile-menu-toggle" type="button" aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={mobileMenuOpen} aria-controls="mobile-primary-navigation" onClick={() => dispatchMobileMenu({ type: 'toggle' })}>
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>
    </div>
    <nav className="main-nav" aria-label="Main navigation">
      {visibleDesktopItems.map((item) => <a key={item.key} href={item.href} className={[item.className, activeNavKey === item.key && 'active'].filter(Boolean).join(' ') || undefined} aria-current={activeNavKey === item.key ? 'page' : undefined}>{navLabel(item)}</a>)}
      {visibleMoreItems.length > 0 && <details className="nav-more">
        <summary className={moreIsActive ? 'active' : undefined} aria-label="More collections">More</summary>
        <div className="nav-more-menu">{visibleMoreItems.map((item) => <a key={item.key} href={item.href} className={activeNavKey === item.key ? 'active' : undefined} aria-current={activeNavKey === item.key ? 'page' : undefined} onClick={(event) => { event.currentTarget.closest('details').open = false; }}>{navLabel(item)}</a>)}</div>
      </details>}
    </nav>
    <nav id="mobile-primary-navigation" className="mobile-nav" aria-label="Mobile navigation" hidden={!mobileMenuOpen}>
      {visibleNavItems.map((item) => <a key={item.key} href={item.href} className={[item.className, activeNavKey === item.key && 'active'].filter(Boolean).join(' ') || undefined} aria-current={activeNavKey === item.key ? 'page' : undefined} onClick={() => dispatchMobileMenu({ type: 'close' })}>{navLabel(item)}</a>)}
    </nav>
  </header>;
}
