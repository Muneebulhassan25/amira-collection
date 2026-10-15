import { collectionHref } from '../../utils/router.js';
import { useStoreData } from '../../context/StoreDataContext.jsx';

export default function SiteFooter() {
  const { collections, settings } = useStoreData();
  const publishedCollections = collections.filter((item) => item.displayStatus !== 'draft');
  const brandParts = settings.storeName.trim().split(/\s+/);
  const brandFirst = brandParts.shift() || settings.storeName;
  const brandRest = brandParts.join(' ');
  return <footer className="site-footer">
    <div className="footer-main">
      <div className="footer-brand"><a className="brand" href="#/">{brandFirst} {brandRest && <span>{brandRest}</span>}</a><p>Thoughtful pieces for a life in motion.</p></div>
      <div className="footer-column"><h2>Explore</h2>{publishedCollections.map((item) => <a key={item.id} className={item.id === 'sale' ? 'sale-nav-link' : undefined} href={collectionHref(item.id)}>{item.title}</a>)}</div>
      <div className="footer-column"><h2>We’re here to help</h2>{settings.contactEmail ? <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a> : <span>Contact details will be added before launch.</span>}{settings.contactPhone && <a href={`tel:${settings.contactPhone}`}>{settings.contactPhone}</a>}<span>Shipping & returns · Preview policies</span><span>Size guide available on each piece</span>{settings.instagramUrl && <a href={settings.instagramUrl} target="_blank" rel="noreferrer">Instagram ↗</a>}{settings.facebookUrl && <a href={settings.facebookUrl} target="_blank" rel="noreferrer">Facebook ↗</a>}</div>
      <div className="footer-column footer-note"><h2>A note from our studio</h2><p>We believe getting dressed can feel like coming home to yourself. Thank you for being here.</p></div>
    </div>
    <div className="footer-bottom"><span>© 2026 {settings.storeName}. Independent concept storefront.</span><span>Studio preview · Original placeholder content</span></div>
  </footer>;
}
