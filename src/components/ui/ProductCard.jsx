import { useCart } from '../../context/CartContext.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import ProductImage from './ProductImage.jsx';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  return <article className="product-card">
    <a className="product-image-link" href={`#/product/${product.id}`} aria-label={`View ${product.name}`}>
      <ProductImage className="product-image" src={product.image} alt={product.name} />
      {product.label && <span className="product-label">{product.label}</span>}
      <span className="quick-view">View details <span aria-hidden="true">↗</span></span>
    </a>
    <div className="product-card-info"><div><a className="product-name" href={`#/product/${product.id}`}>{product.name}</a><p className="product-color">{product.color}</p></div><div className="product-prices"><span>{formatCurrency(product.price)}</span>{product.compareAt && <del>{formatCurrency(product.compareAt)}</del>}</div></div>
    <button className="text-button quick-add" type="button" onClick={() => addItem(product.id, { size: product.sizes[0], color: product.color })}>Quick add <span aria-hidden="true">＋</span></button>
  </article>;
}
