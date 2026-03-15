// pages/dashboard/DashboardPage.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, AlertTriangle, XCircle, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight } from 'lucide-react'
import { getDashboardStats } from '../../api/dashboard'
import KPICard from './KPICard'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { formatCompact } from '../../utils/formatNumber'
import { timeAgo } from '../../utils/formatDate'

const MOVEMENT_META = {
  receipt:    { label: 'Receipt',    color: 'text-green-400', bg: 'bg-green-500/10'  },
  delivery:   { label: 'Delivery',   color: 'text-red-400',   bg: 'bg-red-500/10'    },
  transfer:   { label: 'Transfer',   color: 'text-blue-400',  bg: 'bg-blue-500/10'   },
  adjustment: { label: 'Adjustment', color: 'text-gold-400',  bg: 'bg-gold-500/10'   },
}

export default function DashboardPage() {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate              = useNavigate()

  useEffect(() => {
    getDashboardStats()
      .then(({ data }) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const kpis = stats?.kpis

  return (
    <div className="space-y-5">

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <KPICard label="Total Products"    value={kpis ? formatCompact(kpis.total_products) : null} icon={Package}         accent="default" loading={loading} note="with stock" />
        <KPICard label="Low Stock"         value={kpis?.low_stock}          icon={AlertTriangle}   accent="amber"   loading={loading} note="needs reorder" />
        <KPICard label="Out of Stock"      value={kpis?.out_of_stock}       icon={XCircle}         accent="red"     loading={loading} note="zero quantity" />
        <KPICard label="Pending Receipts"  value={kpis?.pending_receipts}   icon={ArrowDownToLine} accent="blue"    loading={loading} note="awaiting validation" />
        <KPICard label="Pending Deliveries"value={kpis?.pending_deliveries} icon={ArrowUpFromLine} accent="gold"    loading={loading} note="to be dispatched" />
        <KPICard label="Pending Transfers" value={kpis?.pending_transfers}  icon={ArrowLeftRight}  accent="green"   loading={loading} note="in progress" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'New Receipt',  path: '/receipts',    icon: ArrowDownToLine, desc: 'Record incoming stock'  },
          { label: 'New Delivery', path: '/deliveries',  icon: ArrowUpFromLine, desc: 'Dispatch to customer'   },
          { label: 'New Transfer', path: '/transfers',   icon: ArrowLeftRight,  desc: 'Move between locations' },
          { label: 'Adjustment',   path: '/adjustments', icon: Package,         desc: 'Fix stock count'        },
        ].map((item) => {
          const Icon = item.icon
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              className="card-hover p-4 text-left group animate-fade-up opacity-0-init">
              <div className="w-8 h-8 rounded-lg bg-gold-500/10 border border-gold-500/20
                              flex items-center justify-center mb-3
                              group-hover:bg-gold-500/20 transition-colors">
                <Icon size={15} className="text-gold-500" />
              </div>
              <p className="text-sm font-semibold dark:text-dark-text light:text-light-text
                             group-hover:text-gold-500 transition-colors">
                {item.label}
              </p>
              <p className="text-xs dark:text-dark-dim light:text-light-dim mt-0.5">{item.desc}</p>
            </button>
          )
        })}
      </div>

      {/* Recent Movements */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4
                        dark:border-dark-border light:border-light-border border-b">
          <div>
            <h3 className="font-display font-bold text-sm tracking-wide dark:text-white light:text-light-text">
              Recent Movements
            </h3>
            <p className="text-xs dark:text-dark-dim light:text-light-dim mt-0.5">
              Last 10 stock operations
            </p>
          </div>
          <button onClick={() => navigate('/movements')}
            className="text-xs text-gold-500 hover:text-gold-400 font-mono tracking-wider transition-colors">
            View All →
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12"><Spinner /></div>
        ) : !stats?.recent_movements?.length ? (
          <EmptyState
            title="No movements yet"
            message="Stock operations will appear here once you start receiving, delivering, or transferring goods."
          />
        ) : (
          <div>
            {stats.recent_movements.map((m, i) => {
              const meta = MOVEMENT_META[m.type] || MOVEMENT_META.adjustment
              return (
                <div key={m.id}
                  className="flex items-center gap-4 px-5 py-3.5
                             dark:hover:bg-dark-surface/60 light:hover:bg-light-surface
                             dark:border-dark-border/50 light:border-light-border border-b last:border-0
                             transition-colors animate-fade-up opacity-0-init"
                  style={{ animationDelay: `${i * 35}ms` }}>
                  <span className={`shrink-0 px-2 py-0.5 rounded text-[11px] font-mono font-medium
                                    tracking-wide ${meta.color} ${meta.bg}`}>
                    {meta.label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium dark:text-dark-text light:text-light-text truncate">
                      {m.product_name}
                    </p>
                    <p className="text-xs dark:text-dark-dim light:text-light-dim truncate mt-0.5">
                      {m.source_name && m.destination_name
                        ? `${m.source_name} → ${m.destination_name}`
                        : m.source_name || m.destination_name || m.reference || '—'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-mono text-sm font-semibold ${
                      m.type === 'delivery' ? 'text-red-400' :
                      m.type === 'receipt'  ? 'text-green-400' : 'dark:text-dark-sub light:text-light-sub'
                    }`}>
                      {m.type === 'delivery' ? '−' : '+'}{m.quantity}
                    </p>
                    <p className="text-xs dark:text-dark-dim light:text-light-dim">{timeAgo(m.created_at)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Low stock alert */}
      {kpis?.low_stock > 0 && (
        <div className="flex items-center justify-between px-5 py-3.5
                        bg-amber-500/5 border border-amber-500/20 rounded-xl
                        animate-fade-up opacity-0-init">
          <div className="flex items-center gap-3">
            <AlertTriangle size={15} className="text-amber-500 shrink-0" />
            <p className="text-sm text-amber-300">
              <span className="font-semibold">{kpis.low_stock} product{kpis.low_stock > 1 ? 's' : ''}</span>
              {' '}below reorder level
              {kpis.out_of_stock > 0 && `, ${kpis.out_of_stock} out of stock`}
            </p>
          </div>
          <button onClick={() => navigate('/products')}
            className="text-xs text-amber-400 hover:text-amber-300 font-mono tracking-wider
                       whitespace-nowrap ml-4 transition-colors">
            View →
          </button>
        </div>
      )}
    </div>
  )
}
