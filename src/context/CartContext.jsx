import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { addCartItem, removeCartItem, setCartItemQuantity } from '../utils/cart.js';

const CartContext = createContext(null);
const STORAGE_KEY = 'atelier-nisa-cart-v1';

function loadCart() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved.filter((item) => item?.productId && Number(item.quantity) > 0) : [];
  } catch { return []; }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);
  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* Local storage can be unavailable in private browsing. */ }
  }, [items]);
  const value = useMemo(() => ({
    items,
    addItem(productId, options = {}) { setItems((current) => addCartItem(current, productId, options)); },
    setQuantity(productId, size, color, quantity) { setItems((current) => setCartItemQuantity(current, productId, size, color, quantity)); },
    removeItem(productId, size, color) { setItems((current) => removeCartItem(current, productId, size, color)); },
  }), [items]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
