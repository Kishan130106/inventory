// components/ui/Badge.jsx
const STYLES = {
  draft:        'bg-zinc-500/10   text-zinc-400   border-zinc-500/20',
  waiting:      'bg-blue-500/10   text-blue-400   border-blue-500/20',
  ready:        'bg-gold-500/10   text-gold-400   border-gold-500/20',
  done:         'bg-green-500/10  text-green-400  border-green-500/20',
  cancelled:    'bg-red-500/10    text-red-400    border-red-500/20',
  pending:      'bg-orange-500/10 text-orange-400 border-orange-500/20',
  in_transit:   'bg-purple-500/10 text-purple-400 border-purple-500/20',
  in_stock:     'bg-green-500/10  text-green-400  border-green-500/20',
  low_stock:    'bg-amber-500/10  text-amber-400  border-amber-500/20',
  out_of_stock: 'bg-red-500/10    text-red-400    border-red-500/20',
  admin:        'bg-gold-500/10   text-gold-400   border-gold-500/20',
  manager:      'bg-blue-500/10   text-blue-400   border-blue-500/20',
  staff:        'bg-zinc-500/10   text-zinc-400   border-zinc-500/20',
}

const LABELS = {
  in_stock:     'In Stock',
  low_stock:    'Low Stock',
  out_of_stock: 'Out of Stock',
  in_transit:   'In Transit',
}

export default function Badge({ status, className = '' }) {
  const style = STYLES[status] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
  const label = LABELS[status] || status?.replace(/_/g, ' ')
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-mono
                      font-medium tracking-wide border rounded capitalize
                      ${style} ${className}`}>
      {label}
    </span>
  )
}
