import { useEffect, useState } from 'react';
import SiteHeader from './components/layout/SiteHeader.jsx';
import SiteFooter from './components/layout/SiteFooter.jsx';
import AnnouncementBar from './components/layout/AnnouncementBar.jsx';
import HomePage from './pages/HomePage.jsx';
import CollectionPage from './pages/CollectionPage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import CartPage from './pages/CartPage.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { parseRoute } from './utils/router.js';

function Storefront() {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash));
  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseRoute(window.location.hash));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  return <CartProvider>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <AnnouncementBar />
    <SiteHeader />
    <main id="main-content">
      {route.page === 'home' && <HomePage />}
      {route.page === 'collection' && <CollectionPage route={route} />}
      {route.page === 'product' && <ProductPage productId={route.id} />}
      {route.page === 'cart' && <CartPage />}
    </main>
    <SiteFooter />
  </CartProvider>;
}

export default function App() { return <Storefront />; }
