import { useCallback, useEffect, useState } from 'react';
import SiteHeader from './components/layout/SiteHeader.jsx';
import SiteFooter from './components/layout/SiteFooter.jsx';
import AnnouncementBar from './components/layout/AnnouncementBar.jsx';
import HomePage from './pages/HomePage.jsx';
import CollectionPage from './pages/CollectionPage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import CartPage from './pages/CartPage.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { parseRoute } from './utils/router.js';
import { StoreDataProvider } from './context/StoreDataContext.jsx';
import AdminLayout from './components/admin/AdminLayout.jsx';
import AdminLoginPage from './pages/admin/AdminLoginPage.jsx';
import { useStoreData } from './context/StoreDataContext.jsx';
import { adminAuthService } from './services/adminAuthService.js';
import { supabaseSelected } from './services/supabaseConfig.js';

function Storefront() {
  const { isLoading, loadError, isLocalOnly } = useStoreData();
  const [route, setRoute] = useState(() => parseRoute(window.location.hash));
  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseRoute(window.location.hash));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  if (isLoading) return <main className="admin-boot-state" role="status">Loading storefront…</main>;
  if (route.page === 'admin-login') return <AdminLoginPage />;
  if (route.page === 'admin') return <AdminRoute section={route.section} />;
  if (!isLocalOnly && loadError) return <main className="admin-boot-state" role="alert"><h1>Store content is unavailable</h1><p>{loadError}</p><p>Check the Supabase project URL, migration status, and public read policies.</p></main>;
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

function AdminRoute({ section }) {
  const [access, setAccess] = useState(() => supabaseSelected ? 'checking' : 'preview');
  const [problem, setProblem] = useState('');
  const checkAccess = useCallback(async () => {
    if (!supabaseSelected) { setAccess('preview'); return; }
    try {
      const status = await adminAuthService.getStaffSession();
      if (status.authorized) { setAccess('authorized'); setProblem(''); }
      else { setAccess('denied'); window.location.hash = '#/admin/login'; }
    } catch (error) { setProblem(error?.message || 'Admin access could not be verified.'); setAccess('error'); }
  }, []);
  useEffect(() => { checkAccess(); }, [checkAccess]);
  useEffect(() => adminAuthService.onAuthStateChange(() => checkAccess()), [checkAccess]);
  if (access === 'checking' || access === 'denied') return <main className="admin-boot-state" role="status">Checking staff access…</main>;
  if (access === 'error') return <main className="admin-boot-state" role="alert"><h1>Admin access unavailable</h1><p>{problem}</p><a href="#/admin/login">Return to sign in</a></main>;
  return <AdminLayout section={section} />;
}

export default function App() { return <StoreDataProvider><Storefront /></StoreDataProvider>; }
