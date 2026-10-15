export function mobileMenuReducer(isOpen, action) {
  if (action.type === 'toggle') return !isOpen;
  if (action.type === 'close' || action.type === 'escape') return false;
  return isOpen;
}
