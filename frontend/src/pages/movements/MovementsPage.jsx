// pages/movements/MovementsPage.jsx
import { useState, useEffect, useCallback } from 'react'
import { getMovements } from '../../api/dashboard'
import Table from '../../components/ui/Table'
import PageHeader from '../../components/layout/PageHeader'
import { formatDateTime } from '../../utils/formatDate'
import { formatQty } from '../../utils/formatNumber'

const TYPES = ['', 'receipt', 'delivery', 'transfer', 'adjustment']
const TYPE_COLORS = {
  receipt:    'text-green-400 bg-green-500/10',
  delivery:   'text-red-400   bg-red-500/10',
  transfer:   'text-blue-400  bg-blue-500/10',
  adjustment: 'text-gold-400  bg-gold-500/10',
}

export default function MovementsPage() {
  const [movements, setMovements] = useState([])
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(true)
  const [type, setType]           = useState('')
  const [offset, setOffset]       = useState(0)
  const LIMIT = 50

  const load = useCallback(() => {
    setLoading(true)
    getMovements({ type: type || undefined, limit: LIMIT, offset })
      .then(({ data }) => { setMovements(data.movements || []); setTotal(data.total || 0) })
      .finally(() => setLoading(false))
  }, [type, offset])

  useEffect(() => { setOffset(0) }, [type])
  useEffect(() => { load() }, [load])

  const columns = [
    { key: 'created_at',   label: 'Date',     width: 150, render: (v) => <span className="text-xs font-mono">{formatDateTime(v)}</span> },
    { key: 'type',         label: 'Type',     width: 110, render: (v) => (
      <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium tracking-wide capitalize ${TYPE_COLORS[v] || ''}`}>{v}</span>
    )},
    { key: 'product_name', label: 'Product',  render: (v, row) => (
      <div>
        <p className="font-medium dark:text-dark-text light:text-light-text">{v}</p>
        <p className="text-xs font-mono dark:text-dark-dim light:text-light-dim">{row.sku}</p>
      </div>
    )},
    { key: 'source_name',      label: 'From',      render: (v) => v || '—' },
    { key: 'destination_name', label: 'To',        render: (v) => v || '—' },
    { key: 'quantity',         label: 'Qty',  width: 90, render: (v, row) => (
      <span className={`font-mono font-semibold ${
        row.type === 'delivery' ? 'text-red-400' : row.type === 'receipt' ? 'text-green-400' : 'dark:text-dark-text light:text-light-text'
      }`}>
        {row.type === 'delivery' ? '−' : '+'}{formatQty(v)}
      </span>
    )},
    { key: 'created_by_name',  label: 'By',   width: 120, render: (v) => v || '—' },
  ]

  return (
    <div className="space-y-5">
      <PageHeader title="Move History" subtitle={`Full stock ledger — ${total} records`} />

      <div className="flex gap-2 flex-wrap">
        {TYPES.map((t) => (
          <button key={t} onClick={() => setType(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
              ${type === t ? 'bg-gold-500/15 border-gold-500/30 text-gold-400'
                : 'dark:bg-dark-card dark:border-dark-border dark:text-dark-sub light:bg-light-card light:border-light-border light:text-light-sub dark:hover:bg-dark-muted light:hover:bg-light-muted'}`}>
            {t === '' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <Table columns={columns} data={movements} loading={loading}
          emptyTitle="No movements found"
          emptyMessage="Stock operations will appear here once you validate receipts, deliveries, or transfers." />
      </div>

      {/* Pagination */}
      {total > LIMIT && (
        <div className="flex items-center justify-between">
          <p className="text-xs dark:text-dark-dim light:text-light-dim font-mono">
            Showing {offset + 1}–{Math.min(offset + LIMIT, total)} of {total}
          </p>
          <div className="flex gap-2">
            <button disabled={offset === 0} onClick={() => setOffset((o) => Math.max(0, o - LIMIT))}
              className="btn-secondary text-xs disabled:opacity-30">← Prev</button>
            <button disabled={offset + LIMIT >= total} onClick={() => setOffset((o) => o + LIMIT)}
              className="btn-secondary text-xs disabled:opacity-30">Next →</button>
          </div>
        </div>
      )}
    </div>
  )
}
