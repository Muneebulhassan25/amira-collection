import { useCart } from '../context/CartContext.jsx';
import { collectionHref } from '../utils/router.js';
import { useStoreData } from '../context/StoreDataContext.jsx';
import { formatCurrency } from '../utils/formatCurrency.js';
import { getCartCount, getCartSubtotal } from '../utils/cart.js';
import ProductImage from '../components/ui/ProductImage.jsx';

export default function CartPage() {
  const { products, settings } = useStoreData();
  const { items, setQuantity, removeItem } = useCart();
  const findProduct = (id) => products.find((product) => product.id === id && product.status !== 'draft');
  const lines = items.map((item) => ({ ...item, product: findProduct(item.productId) })).filter((item) => item.product);
  const subtotal = getCartSubtotal(lines, findProduct);
  return <div className="cart-page"><div className="cart-title"><p className="eyebrow">Your considered edit</p><h1>Your bag <span>({getCartCount(lines)})</span></h1><a className="text-button" href={collectionHref('new-arrivals')}>← Keep exploring</a></div>
    {!lines.length ? <div className="empty-cart"><span className="empty-mark">✳</span><h2>There’s room for something lovely.</h2><p>Your bag is waiting for the pieces that feel like you.</p><a className="button button-dark" href={collectionHref('new-arrivals')}>Explore New Arrivals <span aria-hidden="true">↗</span></a></div> : <div className="cart-layout"><section className="cart-lines" aria-label="Items in your bag">{lines.map((item) => <article className="cart-line" key={`${item.productId}-${item.size}-${item.color}`}><a href={`#/product/${item.product.id}`} className="cart-image"><ProductImage src={item.product.image} alt={item.product.name} /></a><div className="cart-line-info"><a className="product-name" href={`#/product/${item.product.id}`}>{item.product.name}</a><p>{item.color} · {item.size}</p><div className="cart-line-bottom"><div className="quantity-stepper compact"><button type="button" aria-label={`Decrease ${item.product.name} quantity`} onClick={() => setQuantity(item.productId, item.size, item.color, item.quantity - 1)}>−</button><span>{item.quantity}</span><button type="button" aria-label={`Increase ${item.product.name} quantity`} onClick={() => setQuantity(item.productId, item.size, item.color, item.quantity + 1)}>＋</button></div><button className="remove-link" type="button" onClick={() => removeItem(item.productId, item.size, item.color)}>Remove</button></div></div><strong className="cart-line-price">{formatCurrency(item.product.price * item.quantity, settings.currency)}</strong></article>)}</section>
      <aside className="order-summary"><h2>In summary</h2><div className="shipping-progress"><span className="progress-icon">✧</span><p>{subtotal >= 150 ? 'Preview shipping threshold reached.' : `${formatCurrency(150 - subtotal, settings.currency)} from the preview shipping threshold.`}</p><div className="progress-track"><span style={{ width: `${Math.min(100, subtotal / 150 * 100)}%` }} /></div></div><div className="summary-row"><span>Subtotal</span><strong>{formatCurrency(subtotal, settings.currency)}</strong></div><div className="summary-row"><span>Shipping</span><span>Confirmed before launch</span></div><p className="checkout-note">This preview threshold is illustrative. Checkout and delivery details are not connected.</p><button className="button button-dark checkout-button" type="button" disabled>Checkout <span aria-hidden="true">→</span></button><p className="secure-note">Payment integration coming soon</p></aside></div>}
  </div>;
}
