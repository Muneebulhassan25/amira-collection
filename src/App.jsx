import SiteHeader from './components/layout/SiteHeader.jsx';
import SiteFooter from './components/layout/SiteFooter.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <SiteHeader />
      <main id="main-content" className="page-content">
        <section className="welcome-card" aria-labelledby="welcome-title">
          <p className="eyebrow">Project foundation</p>
          <h1 id="welcome-title">A thoughtful shop starts here.</h1>
          <p className="welcome-copy">
            The core of the new shopping experience is ready. The next step is to shape
            the storefront, product catalog, and customer journey around original content.
          </p>
          <span className="status-pill"><span aria-hidden="true" /> Ready for the next step</span>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
