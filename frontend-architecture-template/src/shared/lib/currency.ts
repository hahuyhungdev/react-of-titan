// shared/lib/currency.ts — generic currency formatting utility.
export function formatCurrency(amount: number, currency = 'VND', locale = 'vi-VN'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}
