import { useEffect, useState } from 'react';
import { findProduct, formatCategory } from '../data/products.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { useCart } from '../context/CartContext.jsx';
import ProductImage from '../components/ui/ProductImage.jsx';
import ProductCard from '../components/ui/ProductCard.jsx';

export default function ProductPage({ productId }) {
  const product = findProduct(productId);
  const { addItem } = useCart();
  const [size, setSize] = useState('');
  const [color, setColor] = useState(product?.color || '');
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  useEffect(() => {
    setSize('');
    setColor(product?.color || '');
    setQuantity(1);
    setMessage('');
  }, [productId]);
  if (!product) return <div className="not-found-state"><p className="eyebrow">Studio note</p><h1>We couldn’t find that piece.</h1><p>It may have moved on to a new home.</p><a className="button button-dark" href="#/collections">Browse the collection</a></div>;
  function addToBag() {
    if (!size) { setMessage('Please choose a size to continue.'); return; }
    addItem(product.id, { size, color, quantity });
    setMessage(`${product.name} has been added to your bag.`);
  }
  return <div className="product-page">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span>/</span><a href={`#/collections?category=${product.category}`}>{formatCategory(product.category)}</a><span>/</span><span>{product.name}</span></nav>
    <section className="product-detail"><div className="product-gallery"><div className="product-main-image"><ProductImage src={product.image} alt={`${product.name} in ${color}`} /></div><div className="gallery-caption"><span>ATELIER NISA — STUDIO EDIT</span><span>01 / 02</span></div><div className="product-detail-note"><p>MADE TO MOVE WITH YOU</p><span>Considered texture · Effortless layers · Your own kind of occasion</span></div></div>
      <div className="product-info"><p className="eyebrow">{formatCategory(product.category)} · Studio edit</p><h1>{product.name}</h1><div className="detail-prices"><strong>{formatCurrency(product.price)}</strong>{product.compareAt && <del>{formatCurrency(product.compareAt)}</del>}<span>CAD</span></div><p className="detail-description">{product.description}</p>
        <div className="option-group"><div className="option-heading"><span>Colour</span><strong>{color}</strong></div><div className="color-options">{product.colors.map((option) => <button key={option} type="button" className={`color-option ${color === option ? 'selected' : ''}`} onClick={() => setColor(option)} aria-pressed={color === option} aria-label={`Choose ${option}`}><span style={{ backgroundColor: ({ Olive: '#77785c', Ink: '#282828', Sand: '#c4aa88', Black: '#252525', Oat: '#d9cfbc', Moss: '#77836a', Rosewood: '#986b6d', Midnight: '#323d53', Stone: '#a9a39a', Clay: '#b9785f', Cream: '#e8e1d5', Natural: '#c4ad8c', Sage: '#aab39c', Plum: '#60445c', Espresso: '#593f35', 'Soft Blue': '#8fabc0', Rose: '#c28c94', Forest: '#314838' })[option] || '#9b9081' }} /></button>)}</div></div>
        <div className="option-group"><div className="option-heading"><span>Size</span><button type="button" className="size-guide" aria-expanded={showSizeGuide} onClick={() => setShowSizeGuide((shown) => !shown)}>Size guide {showSizeGuide ? '−' : '↗'}</button></div><div className="size-options">{product.sizes.map((option) => <button key={option} type="button" className={`size-option ${size === option ? 'selected' : ''}`} onClick={() => { setSize(option); setMessage(''); }} aria-pressed={size === option}>{option}</button>)}</div>{showSizeGuide && <div className="size-guide-note" role="note"><strong>A note on fit</strong><p>Our pieces are designed with an easy, relaxed fit. Between sizes? We suggest choosing the smaller size for a closer fit.</p><span>XS 0–2 · S 4–6 · M 8–10 · L 12–14 · XL 16–18</span></div>}</div>
        <div className="option-group quantity-group"><label htmlFor="product-quantity">Quantity</label><div className="quantity-stepper"><button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button><input id="product-quantity" type="number" min="1" max="10" value={quantity} onChange={(event) => setQuantity(Math.min(10, Math.max(1, Number(event.target.value) || 1)))} /><button type="button" aria-label="Increase quantity" onClick={() => setQuantity((value) => Math.min(10, value + 1))}>＋</button></div></div>
        <button type="button" className="button button-dark add-to-bag" onClick={addToBag}>Add to bag <span>{formatCurrency(product.price * quantity)}</span></button><p className="form-message" role="status" aria-live="polite">{message}</p>
        <div className="detail-perks"><p><span>01</span> Shipping details shown in your bag preview</p><p><span>02</span> Return policy will be confirmed before launch</p><p><span>03</span> Checkout setup is in progress</p></div>
        <details className="detail-accordion"><summary>Details & care <span>＋</span></summary><p>Designed with a relaxed, graceful fit. Please follow the care label for best results. Product imagery is representative; colour may vary slightly by screen.</p></details>
      </div></section>
    <section className="content-section related-section"><div className="section-heading"><div><p className="eyebrow">Keep exploring</p><h2>A few more good things</h2></div><a className="text-button" href="#/collections">Shop all <span aria-hidden="true">↗</span></a></div><div className="product-grid">{[findProduct('layla-flow-abaya'), findProduct('noor-knit-set'), findProduct('mira-soft-scarf'), findProduct('nour-pleated-dress')].filter((item) => item.id !== product.id).slice(0, 4).map((item) => <ProductCard key={item.id} product={item} />)}</div></section>
  </div>;
}
