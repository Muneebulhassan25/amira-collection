import { useEffect, useRef, useState } from 'react';
import { useStoreData } from '../../context/StoreDataContext.jsx';
import DashboardPage from '../../pages/admin/DashboardPage.jsx';
import ProductsAdminPage from '../../pages/admin/ProductsAdminPage.jsx';
import CollectionsAdminPage from '../../pages/admin/CollectionsAdminPage.jsx';
import HomepageContentPage from '../../pages/admin/HomepageContentPage.jsx';
import SettingsAdminPage from '../../pages/admin/SettingsAdminPage.jsx';
import OrdersAdminPage from '../../pages/admin/OrdersAdminPage.jsx';
import { adminAuthService } from '../../services/adminAuthService.js';
import { supabaseSelected, supabaseWritesEnabled } from '../../services/supabaseConfig.js';

const sections = [
  ['dashboard', 'Dashboard', '◫'], ['products', 'Products', '◇'], ['collections', 'Collections', '▤'],
  ['homepage', 'Homepage Content', '⌂'], ['orders', 'Orders', '▱'], ['settings', 'Store Settings', '⚙'],
];

export default function AdminLayout({ section = 'dashboard' }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const { persistenceMode, canWrite } = useStoreData();
  const active = sections.some(([key]) => key === section) ? section : 'dashboard';
  const Page = ({ dashboard: DashboardPage, products: ProductsAdminPage, collections: CollectionsAdminPage, homepage: HomepageContentPage, orders: OrdersAdminPage, settings: SettingsAdminPage })[active];
  useEffect(() => {
    if (!menuOpen) return undefined;
    function closeOnEscape(event) { if (event.key === 'Escape') { setMenuOpen(false); menuButtonRef.current?.focus(); } }
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);
  async function logout() {
    await adminAuthService.signOut();
    setMenuOpen(false);
    window.location.hash = '#/admin/login';
  }
  return <div className="admin-app">
    <a className="admin-skip-link" href="#admin-main">Skip to admin content</a>
    <aside className={`admin-sidebar ${menuOpen ? 'is-open' : ''}`}>
      <a className="admin-brand" href="#/admin"><span className="admin-brand-mark">AC</span><span>AMIRA Collection<small>STORE ADMIN</small></span></a>
      <nav className="admin-navigation" id="admin-navigation" aria-label="Admin navigation">
        <p className="admin-nav-label">Workspace</p>
        {sections.map(([key, label, icon]) => <a key={key} href={`#/admin${key === 'dashboard' ? '' : `/${key}`}`} className={active === key ? 'active' : ''} aria-current={active === key ? 'page' : undefined} onClick={() => setMenuOpen(false)}><span aria-hidden="true">{icon}</span>{label}</a>)}
        <p className="admin-nav-label admin-nav-label-secondary">Storefront</p>
        <a href="#/" className="admin-nav-external" onClick={() => setMenuOpen(false)}><span aria-hidden="true">↗</span>View Store</a>
      </nav>
      <div className="admin-sidebar-bottom"><div className="admin-user-mark">AN</div><div><strong>{supabaseSelected ? 'Authorized staff' : 'Local preview'}</strong><small>{persistenceMode}</small></div><button className="admin-logout" type="button" aria-label={supabaseSelected ? 'Log out of admin' : 'Exit admin preview'} onClick={logout}><span aria-hidden="true">↪</span><span>Logout</span></button></div>
    </aside>
    {menuOpen && <button className="admin-scrim" type="button" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
    <div className="admin-main-column">
      <header className="admin-topbar"><button ref={menuButtonRef} className="admin-mobile-toggle" type="button" aria-label={menuOpen ? 'Close admin navigation' : 'Open admin navigation'} aria-expanded={menuOpen} aria-controls="admin-navigation" onClick={() => setMenuOpen((open) => !open)}><span /><span /><span /></button><div><span className="admin-topbar-eyebrow">Workspace /</span> {sections.find(([key]) => key === active)?.[1]}</div><span className="admin-preview-pill"><i />{supabaseSelected ? 'Supabase mode' : 'Preview mode'}</span></header>
      <main className="admin-content" id="admin-main">{!supabaseSelected ? <div className="admin-preview-notice"><span aria-hidden="true">ⓘ</span><p><strong>Local preview only.</strong> Changes save in this browser and update this preview storefront. There is no shared database or live inventory connection.</p></div> : <div className="admin-preview-notice"><span aria-hidden="true">ⓘ</span><p><strong>Supabase connected · {canWrite && supabaseWritesEnabled ? 'writes enabled' : 'read-only mode'}.</strong> {canWrite && supabaseWritesEnabled ? 'Database policies still enforce staff permissions.' : 'Changes cannot be saved until you verify the migration, staff access, and RLS checks, then explicitly enable writes.'}</p></div>}<Page /></main>
    </div>
  </div>;
}
