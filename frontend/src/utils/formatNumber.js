// utils/formatNumber.js

/**
 * 1500 → "1,500"
 */
export const formatQty = (n) => {
  if (n === null || n === undefined) return '—'
  return Number(n).toLocaleString('en-IN')
}

/**
 * 1500 → "1.5K"  /  1500000 → "1.5M"
 */
export const formatCompact = (n) => {
  if (n === null || n === undefined) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

/**
 * Stock status label
 */
export const stockStatusLabel = (status) => {
  const map = {
    in_stock:     'In Stock',
    low_stock:    'Low Stock',
    out_of_stock: 'Out of Stock',
  }
  return map[status] || status
}
