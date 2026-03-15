// layouts/AppLayout.jsx
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import Topbar from '../components/layout/Topbar'

// Map routes to page titles/subtitles
const PAGE_META = {
  '/dashboard':   { title: 'DASHBOARD',    subtitle: 'Overview of inventory operations' },
  '/products':    { title: 'PRODUCTS',     subtitle: 'Manage sports equipment catalog' },
  '/receipts':    { title: 'RECEIPTS',     subtitle: 'Incoming stock from suppliers' },
  '/deliveries':  { title: 'DELIVERIES',   subtitle: 'Outgoing stock to customers' },
  '/transfers':   { title: 'TRANSFERS',    subtitle: 'Internal stock movements' },
  '/adjustments': { title: 'ADJUSTMENTS',  subtitle: 'Physical count reconciliation' },
  '/movements':   { title: 'MOVE HISTORY', subtitle: 'Full inventory ledger' },
  '/settings':    { title: 'SETTINGS',     subtitle: 'Warehouses, categories & users' },
}

export default function AppLayout() {
  const location = useLocation()
  const meta = PAGE_META[location.pathname] || {}

  return (
    <div className="flex h-screen overflow-hidden bg-carbon-900">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar title={meta.title} subtitle={meta.subtitle} />

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
