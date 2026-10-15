export function formatCurrency(amount, currency = 'CAD', locale = 'en-CA') {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}
