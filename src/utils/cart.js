export function addCartItem(items, productId, options = {}) {
  const size = options.size || '';
  const color = options.color || '';
  const quantity = Math.max(1, Number(options.quantity) || 1);
  const match = items.find((item) => item.productId === productId && item.size === size && item.color === color);
  return match
    ? items.map((item) => item === match ? { ...item, quantity: item.quantity + quantity } : item)
    : [...items, { productId, size, color, quantity }];
}

export function setCartItemQuantity(items, productId, size, color, quantity) {
  return quantity < 1
    ? items.filter((item) => !(item.productId === productId && item.size === size && item.color === color))
    : items.map((item) => item.productId === productId && item.size === size && item.color === color ? { ...item, quantity } : item);
}

export function removeCartItem(items, productId, size, color) {
  return items.filter((item) => !(item.productId === productId && item.size === size && item.color === color));
}

export function getCartCount(items) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function getCartSubtotal(items, getProduct) {
  return items.reduce((total, item) => total + (getProduct(item.productId)?.price || 0) * item.quantity, 0);
}
