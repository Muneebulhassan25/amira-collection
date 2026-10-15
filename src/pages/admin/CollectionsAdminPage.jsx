import { useState } from 'react';
import { useStoreData } from '../../context/StoreDataContext.jsx';
import { assignProductToCollection, isProductSaleEligible } from '../../utils/adminProducts.js';

export default function CollectionsAdminPage() {
  const store = useStoreData();
  const [records, setRecords] = useState(() => store.collections.map((item) => ({ ...item })));
  const [assignments, setAssignments] = useState(() => Object.fromEntries(store.collections.map((collection) => [collection.id, store.products.filter((product) => collection.id === 'new-arrivals' ? product.isNewArrival : collection.id === 'sale' ? isProductSaleEligible(product) : product.category === collection.id || product.collectionIds?.includes(collection.id)).map((product) => product.id)])));
  const [notice, setNotice] = useState('');
  function edit(id, field, value) { setRecords((current) => current.map((item) => item.id === id ? { ...item, [field]: value } : item)); }
  function toggleProduct(collectionId, productId, checked) { setAssignments((current) => ({ ...current, [collectionId]: checked ? [...new Set([...(current[collectionId] || []), productId])] : (current[collectionId] || []).filter((id) => id !== productId) })); }
  async function save() {
    const products = store.products.map((product) => records.reduce((updated, collection) => {
      const selected = assignments[collection.id]?.includes(product.id) || false;
      return assignProductToCollection(updated, collection.id, selected);
    }, product));
    const homepage = { ...store.homepage, featuredCollectionIds: records.filter((item) => item.featuredOnHomepage && item.displayStatus === 'published').map((item) => item.id) };
    const result = await store.saveCollectionSetup(records, products, homepage);
    setNotice(result.ok ? `Collection details, assignments, and homepage selections saved to ${store.isLocalOnly ? 'this browser preview' : 'Supabase'}.` : result.error);
  }
  return <section className="admin-page"><div className="admin-page-heading"><div><p className="admin-eyebrow">Merchandising</p><h1>Collections</h1><p>Manage collection details, product assignments, and homepage placement.</p></div><button className="admin-primary-button" type="button" onClick={save}>Save changes <span aria-hidden="true">→</span></button></div>{notice && <p className="admin-feedback" role="status">{notice}</p>}<p className="admin-inline-notice">New Arrivals membership comes from each product’s New arrival flag. SALE includes only explicitly marked products or products with a valid compare-at price. Changes here never create a fake discount.</p><div className="admin-collection-list">{records.map((collection) => {
    const isSale = collection.id === 'sale';
    const isArrival = collection.id === 'new-arrivals';
    return <details className="admin-panel admin-collection-record" key={collection.id}><summary><span className="admin-collection-summary-mark">{collection.title.slice(0, 1)}</span><span className="admin-collection-summary-copy"><strong>{collection.title}</strong><small>/{collection.id} · {isSale ? store.products.filter(isProductSaleEligible).length : (assignments[collection.id] || []).length} products eligible/assigned</small></span><span className={`admin-status status-${collection.displayStatus}`}>{collection.displayStatus}</span><span className="admin-collection-expand">⌄</span></summary><div className="admin-collection-editor"><div className="admin-form-grid"><label className="admin-field"><span className="admin-field-label">Collection title</span><input value={collection.title} onChange={(event) => edit(collection.id, 'title', event.target.value)} /></label><label className="admin-field"><span className="admin-field-label">Display status</span><select value={collection.displayStatus} onChange={(event) => edit(collection.id, 'displayStatus', event.target.value)}><option value="published">Published</option><option value="draft">Hidden / draft</option></select></label><label className="admin-field span-2"><span className="admin-field-label">Description</span><textarea rows="2" value={collection.description} onChange={(event) => edit(collection.id, 'description', event.target.value)} /></label><label className="admin-field span-2"><span className="admin-field-label">Collection image URL</span><input value={collection.image || ''} onChange={(event) => edit(collection.id, 'image', event.target.value)} placeholder="https://example.com/collection.jpg" /></label></div><label className="admin-check admin-featured-collection"><input type="checkbox" checked={collection.featuredOnHomepage} onChange={(event) => edit(collection.id, 'featuredOnHomepage', event.target.checked)} /><span className="admin-check-box" aria-hidden="true">✓</span><span>Show in homepage collections</span></label><div className="admin-assignment-heading"><div><h3>Product assignment</h3><p>{isSale ? 'Sale is computed from an explicit sale flag or a valid compare-at price.' : isArrival ? 'Toggle arrival eligibility from this list.' : 'Choose which products belong in this collection.'}</p></div></div><div className="admin-assignment-grid">{store.products.map((product) => {
        const checked = isSale ? isProductSaleEligible(product) : (assignments[collection.id] || []).includes(product.id);
        const isPrimaryCategory = !isSale && !isArrival && product.category === collection.id;
        const disabled = isPrimaryCategory || (isSale && !!(Number(product.compareAt) > Number(product.price)));
        return <label className={`admin-assignment-option ${disabled ? 'is-readonly' : ''}`} key={product.id}><input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => toggleProduct(collection.id, product.id, event.target.checked)} /><span className="admin-check-box" aria-hidden="true">✓</span><span><strong>{product.name}</strong><small>{isSale ? (disabled ? 'Valid sale price' : product.onSale ? 'Explicit sale flag' : 'Not eligible') : isPrimaryCategory ? 'Primary category' : product.category}</small></span></label>;
      })}</div></div></details>;
  })}</div></section>;
}
