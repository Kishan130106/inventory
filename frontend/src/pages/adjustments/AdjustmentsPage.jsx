// pages/adjustments/AdjustmentsPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { getAdjustments } from '../../api/adjustments'
import Table from '../../components/ui/Table'
import PageHeader from '../../components/layout/PageHeader'
import { formatQty } from '../../utils/formatNumber'
import { formatDateTime } from '../../utils/formatDate'

export default function AdjustmentsPage() {
  const [adjustments, setAdjustments] = useState([])
  const [loading, setLoading]         = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getAdjustments()
      .then(({ data }) => setAdjustments(data.adjustments || []))
      .finally(() => setLoading(false))
  }, [])

  const columns = [
    { key: 'created_at',      label: 'Date',         width: 150, render: (v) => formatDateTime(v) },
    { key: 'product_name',    label: 'Product',       render: (v, row) => (
      <div>
        <p className="font-semibold dark:text-white light:text-light-text">{v}</p>
        <p className="text-xs font-mono dark:text-dark-dim light:text-light-dim">{row.sku}</p>
      </div>
    )},
    { key: 'location_name',   label: 'Location'   },
    { key: 'system_quantity', label: 'System Qty',  width: 110, render: (v) => <span className="font-mono">{formatQty(v)}</span> },
    { key: 'counted_quantity',label: 'Counted Qty', width: 110, render: (v) => <span className="font-mono">{formatQty(v)}</span> },
    { key: 'difference',      label: 'Difference',  width: 110, render: (v) => (
      <span className={`font-mono font-semibold ${v > 0 ? 'text-green-400' : v < 0 ? 'text-red-400' : 'dark:text-dark-dim light:text-light-dim'}`}>
        {v > 0 ? '+' : ''}{v}
      </span>
    )},
    { key: 'created_by_name', label: 'By',           render: (v) => v || '—' },
  ]

  return (
    <div className="space-y-5">
      <PageHeader title="Adjustments" subtitle="Physical count reconciliation"
        action={<button onClick={() => navigate('/adjustments/new')} className="btn-primary"><Plus size={15} /> New Adjustment</button>}
      />
      <div className="card overflow-hidden">
        <Table columns={columns} data={adjustments} loading={loading}
          emptyTitle="No adjustments yet"
          emptyMessage="Create an adjustment when physical stock count differs from system records." />
      </div>
    </div>
  )
}
