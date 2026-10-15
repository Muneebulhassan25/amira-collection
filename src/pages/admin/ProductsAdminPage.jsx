import { useMemo, useState } from 'react';
import { useStoreData } from '../../context/StoreDataContext.jsx';
import { categories } from '../../data/products.js';
import { hasValidSalePrice } from '../../utils/catalog.js';
import { slugifyProductName, validateProductDraft } from '../../utils/adminProducts.js';
import ProductImage from '../../components/ui/ProductImage.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';

const productCategories = categories.filter((item) => ['dresses', 'abayas', 'sets', 'scarves'].includes(item.id)).concat([{ id: 'swimwear', name: 'Swimwear' }]);
const list = (value) => String(value || '').split(',').map((part) => part.trim()).filter(Boolean);
const initialDraft = (product) => ({
  id: product?.id || '', name: product?.name || '', description: product?.description || '', price: product?.price ?? '', compareAt: product?.compareAt ?? '',
  category: product?.category || 'dresses', collectionIds: [...(product?.collectionIds || [])], sku: product?.sku || '', inventoryQuantity: product?.inventoryQuantity ?? '',
  sizes: (product?.sizes || []).join(', '), colors: (product?.colors || []).join(', '), tags: (product?.tags || []).join(', '),
  images: product?.images?.length ? [...product.images] : (product?.image ? [product.image] : ['']), mainImageIndex: product?.mainImageIndex || 0,
  status: product?.status || 'published', featured: product?.featured === true, isNewArrival: product?.isNewArrival === true, onSale: product?.onSale === true,
  color: product?.color || product?.colors?.[0] || '', label: product?.label || '', arrivalDate: product?.arrivalDate || '', bestSellerRank: product?.bestSellerRank ?? '', relevanceRank: product?.relevanceRank ?? '',
});

export default function ProductsAdminPage() {
  const store = useStoreData();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sort, setSort] = useState('name');
  const [editorProduct, setEditorProduct] = useState(undefined);
  const [notice, setNotice] = useState('');
  const visibleProducts = useMemo(() => store.products.filter((product) => {
    const matchesSearch = `${product.name} ${product.sku || ''}`.toLowerCase().includes(search.trim().toLowerCase());
    return matchesSearch && (categoryFilter === 'all' || product.category === categoryFilter) && (statusFilter === 'all' || (product.status || 'published') === statusFilter);
  }).sort((a, b) => sort === 'price' ? Number(a.price) - Number(b.price) : sort === 'stock' ? (a.inventoryQuantity ?? Infinity) - (b.inventoryQuantity ?? Infinity) : a.name.localeCompare(b.name)), [store.products, search, categoryFilter, statusFilter, sort]);
  async function removeProduct(product) {
    if (!window.confirm(`Delete “${product.name}”? This removes it from this browser’s preview catalog and homepage selections.`)) return;
    const result = await store.deleteProduct(product.id);
    setNotice(result.ok ? `${product.name} was removed from the catalog.` : result.error);
  }
  if (editorProduct !== undefined) return <ProductEditor key={editorProduct?.id || 'new-product'} product={editorProduct} products={store.products} collections={store.collections} onCancel={() => setEditorProduct(undefined)} onSave={async (product) => {
    const result = await store.saveProduct(product);
    if (result.ok) { setNotice(`${product.name} saved to ${store.isLocalOnly ? 'this browser preview' : 'the Supabase catalogue'}.`); setEditorProduct(undefined); }
    return result;
  }} />;
  return <section className="admin-page">
    <div className="admin-page-heading"><div><p className="admin-eyebrow">Catalog management</p><h1>Products</h1><p>{store.isLocalOnly ? 'Maintain this browser’s preview catalog and storefront visibility.' : store.canWrite ? 'Manage the shared catalogue. Database policies verify each change.' : 'Supabase catalogue is read-only until backend checks are complete.'}</p></div><button className="admin-primary-button" type="button" onClick={() => setEditorProduct(null)}>＋ Add product</button></div>
    {notice && <p className="admin-feedback" role="status">{notice}</p>}
    <div className="admin-toolbar admin-panel"><label className="admin-search"><span className="sr-only">Search products</span><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or SKU" /></label><label><span>Category</span><select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option value="all">All categories</option>{productCategories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label><span>Status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All statuses</option><option value="published">Published</option><option value="draft">Draft</option></select></label><label><span>Sort</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="name">Name, A–Z</option><option value="price">Price, low–high</option><option value="stock">Stock, low–high</option></select></label></div>
    <div className="admin-panel admin-products-panel"><div className="admin-table-count">{visibleProducts.length} products <span>· {store.persistenceMode}</span></div>{visibleProducts.length ? <div className="admin-product-table-wrap"><table className="admin-product-table"><thead><tr><th>Product</th><th>Price</th><th>Category / collections</th><th>Stock</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{visibleProducts.map((product) => <tr key={product.id}><td><div className="admin-product-cell"><ProductImage src={product.image} alt="" /><span><strong>{product.name}</strong><small>{product.sku || 'SKU not entered'}</small></span></div></td><td>{formatCurrency(product.price, store.settings.currency)}{hasValidSalePrice(product) && <small className="admin-sale-tag">Sale</small>}</td><td><span>{productCategories.find((item) => item.id === product.category)?.name || product.category}</span><small>{(product.collectionIds || []).map((id) => store.collections.find((collection) => collection.id === id)?.title).filter(Boolean).join(', ') || '—'}</small></td><td>{Number.isInteger(product.inventoryQuantity) ? product.inventoryQuantity : <span className="admin-muted">Not tracked</span>}</td><td><span className={`admin-status status-${product.status || 'published'}`}>{product.status || 'published'}</span></td><td><div className="admin-row-actions"><button type="button" onClick={() => setEditorProduct(product)}>Edit</button><button className="danger" type="button" onClick={() => removeProduct(product)}>Delete</button></div></td></tr>)}</tbody></table></div> : <div className="admin-empty-state"><span>⌕</span><h2>No matching products</h2><p>{store.isLocalOnly ? 'Change your filters or add a product to the preview catalog.' : 'No published or draft products are currently available in this database view.'}</p><button className="admin-secondary-button" type="button" onClick={() => { setSearch(''); setCategoryFilter('all'); setStatusFilter('all'); }}>Clear filters</button></div>}</div>
  </section>;
}

function ProductEditor({ product, products, collections, onCancel, onSave }) {
  const { settings, isLocalOnly } = useStoreData();
  const [draft, setDraft] = useState(() => initialDraft(product));
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState('');
  function update(field, value) { setDraft((current) => ({ ...current, [field]: value })); }
  function updateImage(index, value) { update('images', draft.images.map((image, itemIndex) => itemIndex === index ? value : image)); }
  function moveImage(index, direction) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= draft.images.length) return;
    const images = [...draft.images]; [images[index], images[nextIndex]] = [images[nextIndex], images[index]];
    update('images', images); update('mainImageIndex', draft.mainImageIndex === index ? nextIndex : draft.mainImageIndex === nextIndex ? index : draft.mainImageIndex);
  }
  async function submit(event) {
    event.preventDefault();
    const clean = { ...draft, name: draft.name.trim(), price: Number(draft.price), compareAt: draft.compareAt === '' ? undefined : Number(draft.compareAt), inventoryQuantity: draft.inventoryQuantity === '' ? null : Number(draft.inventoryQuantity), images: draft.images.map((image) => image.trim()), mainImageIndex: Number(draft.mainImageIndex), sizes: list(draft.sizes), colors: list(draft.colors), tags: list(draft.tags), collectionIds: [...draft.collectionIds], color: draft.color || list(draft.colors)[0] || '', image: draft.images[Number(draft.mainImageIndex)]?.trim() || '', label: draft.isNewArrival ? 'New arrival' : draft.label };
    const validation = validateProductDraft(clean, { isNew: !product, existingProducts: products });
    setErrors(validation);
    if (Object.keys(validation).length) { setFeedback('Please fix the highlighted fields.'); return; }
    if (!clean.id) {
      const base = slugifyProductName(clean.name) || 'new-product';
      let id = base; let suffix = 2;
      while (products.some((item) => item.id === id)) id = `${base}-${suffix++}`;
      clean.id = id;
      const now = new Date().toISOString().slice(0, 10);
      clean.arrivalDate = clean.arrivalDate || now;
      clean.relevanceRank = clean.relevanceRank === '' ? Math.max(0, ...products.map((item) => Number(item.relevanceRank) || 0)) + 1 : Number(clean.relevanceRank);
      clean.bestSellerRank = clean.bestSellerRank === '' ? Math.max(0, ...products.map((item) => Number(item.bestSellerRank) || 0)) + 1 : Number(clean.bestSellerRank);
    } else {
      clean.relevanceRank = clean.relevanceRank === '' ? undefined : Number(clean.relevanceRank);
      clean.bestSellerRank = clean.bestSellerRank === '' ? undefined : Number(clean.bestSellerRank);
    }
    if (clean.relevanceRank !== undefined) clean.relevanceRank = Number(clean.relevanceRank);
    if (clean.bestSellerRank !== undefined) clean.bestSellerRank = Number(clean.bestSellerRank);
    if (clean.compareAt === undefined) delete clean.compareAt;
    const result = await onSave(clean);
    if (!result?.ok) setFeedback(result?.error || 'The product could not be saved.');
  }
  const assignableCollections = collections.filter((item) => !['all', 'new-arrivals', 'sale'].includes(item.id));
  return <section className="admin-page"><div className="admin-page-heading"><div><p className="admin-eyebrow">{product ? 'Update catalog details' : 'Create a new catalog item'}</p><h1>{product ? 'Edit product' : 'Add product'}</h1><p>{isLocalOnly ? 'Saved items update this browser’s storefront preview.' : 'Changes update the database only when Supabase writes are explicitly enabled.'}</p></div><button className="admin-back-button" type="button" onClick={onCancel}>← Back to products</button></div>
    <form className="admin-form" onSubmit={submit} noValidate>
      <section className="admin-panel admin-form-section"><div className="admin-form-section-heading"><span>01</span><div><h2>Product details</h2><p>Core content shown on cards and product pages.</p></div></div><div className="admin-form-grid"><Field label="Product name" error={errors.name}><input value={draft.name} onChange={(event) => update('name', event.target.value)} required /></Field><Field label="SKU" hint="Unique product code" error={errors.sku}><input value={draft.sku} onChange={(event) => update('sku', event.target.value)} required /></Field><Field label="Description" className="span-2" error={errors.description}><textarea rows="4" value={draft.description} onChange={(event) => update('description', event.target.value)} required /></Field><Field label="Category" error={errors.category}><select value={draft.category} onChange={(event) => update('category', event.target.value)}>{productCategories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field><Field label="Publication status"><select value={draft.status} onChange={(event) => update('status', event.target.value)}><option value="published">Published</option><option value="draft">Draft</option></select></Field><Field label="Sizes" hint="Separate choices with commas"><input value={draft.sizes} onChange={(event) => update('sizes', event.target.value)} placeholder="XS, S, M, L or One size" /></Field><Field label="Colours" hint="Separate choices with commas"><input value={draft.colors} onChange={(event) => update('colors', event.target.value)} placeholder="Olive, Sand" /></Field><Field label="Default colour label"><input value={draft.color} onChange={(event) => update('color', event.target.value)} /></Field><Field label="Tags" hint="Separate tags with commas"><input value={draft.tags} onChange={(event) => update('tags', event.target.value)} placeholder="linen, occasion" /></Field></div></section>
      <section className="admin-panel admin-form-section"><div className="admin-form-section-heading"><span>02</span><div><h2>Price and stock</h2><p>Use real approved prices. A compare-at price must be higher than the selling price.</p></div></div><div className="admin-form-grid"><Field label={`Price (${settings.currency})`} error={errors.price}><input type="number" min="0" step="0.01" value={draft.price} onChange={(event) => update('price', event.target.value)} required /></Field><Field label="Compare-at / sale price" hint="Leave blank when there is no approved original price." error={errors.compareAt}><input type="number" min="0" step="0.01" value={draft.compareAt} onChange={(event) => update('compareAt', event.target.value)} /></Field><Field label="Inventory quantity" hint={product && draft.inventoryQuantity === '' ? 'Blank means stock is not tracked for this preview item.' : 'Whole units available'} error={errors.inventoryQuantity}><input type="number" min="0" step="1" value={draft.inventoryQuantity} onChange={(event) => update('inventoryQuantity', event.target.value)} placeholder="Not tracked" /></Field><Field label="Arrival date" hint="YYYY-MM-DD"><input type="date" value={draft.arrivalDate} onChange={(event) => update('arrivalDate', event.target.value)} /></Field><Field label="Preview best-seller rank" hint="Lower numbers sort first; not sales data"><input type="number" min="1" step="1" value={draft.bestSellerRank} onChange={(event) => update('bestSellerRank', event.target.value)} /></Field><Field label="Preview relevance rank" hint="Lower numbers sort first"><input type="number" min="1" step="1" value={draft.relevanceRank} onChange={(event) => update('relevanceRank', event.target.value)} /></Field></div><div className="admin-check-row"><Check label="Featured product" checked={draft.featured} onChange={(value) => update('featured', value)} /><Check label="New arrival" checked={draft.isNewArrival} onChange={(value) => update('isNewArrival', value)} /><Check label="Explicitly marked for sale" checked={draft.onSale} onChange={(value) => update('onSale', value)} /></div><p className="admin-form-note">SALE appears only for explicitly marked items or items with a valid compare-at price. Preview ranking values are editorial placeholders, not real sales data.</p></section>
      <section className="admin-panel admin-form-section"><div className="admin-form-section-heading"><span>03</span><div><h2>Collections</h2><p>Choose where this item should appear.</p></div></div><div className="admin-checkbox-grid">{assignableCollections.map((collection) => <Check key={collection.id} label={collection.title} checked={draft.collectionIds.includes(collection.id)} onChange={(checked) => update('collectionIds', checked ? [...new Set([...draft.collectionIds, collection.id])] : draft.collectionIds.filter((id) => id !== collection.id))} />)}</div><p className="admin-form-note">New Arrivals is managed by its product flag. SALE eligibility is controlled by the sale flag or valid sale price.</p></section>
      <section className="admin-panel admin-form-section"><div className="admin-form-section-heading"><span>04</span><div><h2>Images</h2><p>Use public image URLs for this preview. Upload storage is not connected.</p></div></div><div className="admin-image-list">{draft.images.map((image, index) => <div className="admin-image-row" key={index}><label className="admin-main-image-choice"><input type="radio" name="main-image" checked={Number(draft.mainImageIndex) === index} onChange={() => update('mainImageIndex', index)} aria-label={`Set image ${index + 1} as main`} /><span>Main</span></label><input aria-label={`Image URL ${index + 1}`} value={image} onChange={(event) => updateImage(index, event.target.value)} placeholder="https://example.com/product-image.jpg" /><button type="button" onClick={() => moveImage(index, -1)} disabled={index === 0} aria-label={`Move image ${index + 1} up`}>↑</button><button type="button" onClick={() => moveImage(index, 1)} disabled={index === draft.images.length - 1} aria-label={`Move image ${index + 1} down`}>↓</button><button type="button" className="danger" disabled={draft.images.length <= 1} onClick={() => { update('images', draft.images.filter((_, itemIndex) => itemIndex !== index)); update('mainImageIndex', Math.max(0, Number(draft.mainImageIndex) > index ? Number(draft.mainImageIndex) - 1 : Math.min(Number(draft.mainImageIndex), draft.images.length - 2))); }} aria-label={`Remove image ${index + 1}`}>×</button></div>)}</div>{errors.images && <p className="admin-field-error" role="alert">{errors.images}</p>}{errors.mainImageIndex && <p className="admin-field-error" role="alert">{errors.mainImageIndex}</p>}<button className="admin-add-image" type="button" onClick={() => { update('images', [...draft.images, '']); if (draft.images.length === 0) update('mainImageIndex', 0); }}>＋ Add another image</button></section>
      {feedback && <p className="admin-form-feedback" role="alert">{feedback}</p>}<div className="admin-form-actions"><button className="admin-secondary-button" type="button" onClick={onCancel}>Cancel</button><button className="admin-primary-button" type="submit">Save product <span aria-hidden="true">→</span></button></div>
    </form>
  </section>;

}

function Field({ label, hint, error, className = '', children }) {
  return <label className={`admin-field ${className}`}><span className="admin-field-label">{label}</span>{children}{hint && <small>{hint}</small>}{error && <small className="admin-field-error" role="alert">{error}</small>}</label>;
}

function Check({ label, checked, onChange }) {
  return <label className="admin-check"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><span className="admin-check-box" aria-hidden="true">✓</span><span>{label}</span></label>;
}
