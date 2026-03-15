// pages/receipts/ReceiptsPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { getReceipts } from '../../api/receipts'
import Table from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import PageHeader from '../../components/layout/PageHeader'
import { formatDate } from '../../utils/formatDate'

const STATUSES = ['', 'draft', 'waiting', 'done', 'cancelled']

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [status, setStatus]     = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    getReceipts({ status: status || undefined })
      .then(({ data }) => setReceipts(data.receipts || []))
      .finally(() => setLoading(false))
  }, [status])

  const columns = [
    { key: 'id',               label: '#',          width: 60,  render: (v) => <span className="font-mono text-xs">#{v}</span> },
    { key: 'supplier',         label: 'Supplier',               render: (v) => v || '—' },
    { key: 'destination_name', label: 'Destination',            render: (v) => v || '—' },
    { key: 'item_count',       label: 'Items',      width: 80,  render: (v) => <span className="font-mono">{v}</span> },
    { key: 'status',           label: 'Status',     width: 110, render: (v) => <Badge status={v} /> },
    { key: 'created_by_name',  label: 'Created By',             render: (v) => v || '—' },
    { key: 'created_at',       label: 'Date',       width: 130, render: (v) => formatDate(v) },
  ]

  return (
    <div className="space-y-5">
      <PageHeader title="Receipts" subtitle="Incoming stock from suppliers"
        action={
          <button onClick={() => navigate('/receipts/new')} className="btn-primary">
            <Plus size={15} /> New Receipt
          </button>
        }
      />
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <button key={s}
            onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
              ${status === s
                ? 'bg-gold-500/15 border-gold-500/30 text-gold-400'
                : 'dark:bg-dark-card dark:border-dark-border dark:text-dark-sub light:bg-light-card light:border-light-border light:text-light-sub dark:hover:bg-dark-muted light:hover:bg-light-muted'
              }`}>
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
      <div className="card overflow-hidden">
        <Table columns={columns} data={receipts} loading={loading}
          emptyTitle="No receipts found"
          emptyMessage="Create a receipt when stock arrives from a supplier."
          onRowClick={(row) => navigate(`/receipts/${row.id}`)} />
      </div>
    </div>
  )
}
