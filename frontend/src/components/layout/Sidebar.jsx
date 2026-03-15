// components/layout/Sidebar.jsx
import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  LayoutDashboard, Package, ArrowDownToLine, ArrowUpFromLine,
  ArrowLeftRight, ClipboardList, History, Settings, ChevronRight,
} from 'lucide-react'
import { selectSidebarOpen } from '../../store/uiSlice'
import { selectUser } from '../../store/authSlice'

const NAV = [
  { label: 'Dashboard',    path: '/dashboard',   icon: LayoutDashboard },
  { label: 'Products',     path: '/products',    icon: Package },
  { divider: true, label: 'OPERATIONS' },
  { label: 'Receipts',     path: '/receipts',    icon: ArrowDownToLine },
  { label: 'Deliveries',   path: '/deliveries',  icon: ArrowUpFromLine },
  { label: 'Transfers',    path: '/transfers',   icon: ArrowLeftRight },
  { label: 'Adjustments',  path: '/adjustments', icon: ClipboardList },
  { label: 'Move History', path: '/movements',   icon: History },
  { divider: true, label: 'SYSTEM' },
  { label: 'Settings',     path: '/settings',    icon: Settings },
]

export default function Sidebar() {
  const open = useSelector(selectSidebarOpen)
  const user = useSelector(selectUser)

  return (
    <aside className={`
      flex flex-col shrink-0 transition-all duration-300 ease-in-out
      bg-light-surface border-r border-light-border
      dark:bg-dark-surface dark:border-dark-border
      ${open ? 'w-56' : 'w-14'}
    `}>
      {/* Logo */}
      <div className="flex items-center h-14 px-3 gap-2.5 overflow-hidden
                      border-b border-light-border dark:border-dark-border">
        {/* Logo image — round crop */}
        <div className="w-8 h-8 shrink-0 rounded-full overflow-hidden border-2 border-[#1a4b8c]/30 dark:border-gold-500/30">
          <img
            src="/logo.png"
            alt="PSG Logo"
            className="w-full h-full object-cover"
          />
        </div>

        {open && (
          <div className="overflow-hidden">
            <p className="font-display font-bold text-sm text-light-text dark:text-white leading-none">
              Patel Sports
            </p>
            <p className="text-[10px] text-light-sub dark:text-dark-sub leading-none mt-0.5 font-mono">
              & Goods
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 overflow-y-auto overflow-x-hidden space-y-0.5 px-2">
        {NAV.map((item, i) => {
          if (item.divider) {
            return open ? (
              <div key={i} className="px-2 pt-4 pb-1">
                <span className="text-[10px] font-mono font-semibold tracking-[0.2em]
                                 text-light-dim dark:text-dark-dim uppercase">
                  {item.label}
                </span>
              </div>
            ) : <div key={i} className="my-2 border-t border-light-border dark:border-dark-border mx-1" />
          }

          const Icon = item.icon
          return (
            <NavLink key={item.path} to={item.path}
              className={({ isActive }) => `
                flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm
                transition-all duration-150 group relative overflow-hidden
                ${isActive
                  ? 'bg-gold-500/10 text-gold-500 font-semibold'
                  : 'text-light-sub dark:text-dark-sub hover:bg-light-muted dark:hover:bg-dark-muted hover:text-light-text dark:hover:text-dark-text font-medium'
                }
              `}>
              {({ isActive }) => (
                <>
                  <Icon size={16} className={`shrink-0 ${isActive ? 'text-gold-500' : ''}`} />
                  {open && <span className="truncate flex-1">{item.label}</span>}
                  {open && isActive && <ChevronRight size={12} className="text-gold-500/50 ml-auto" />}
                  {!open && (
                    <div className="absolute left-full ml-2 px-2.5 py-1.5
                                    bg-light-card dark:bg-dark-card
                                    border border-light-border dark:border-dark-border
                                    text-light-text dark:text-white
                                    text-xs rounded-lg whitespace-nowrap shadow-xl
                                    opacity-0 group-hover:opacity-100 pointer-events-none
                                    transition-opacity duration-150 z-50 font-medium">
                      {item.label}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* User */}
      {user && (
        <div className="border-t border-light-border dark:border-dark-border p-3
                        flex items-center gap-2.5 overflow-hidden">
          <div className="w-7 h-7 shrink-0 rounded-lg bg-gold-500/15 border border-gold-500/25
                          flex items-center justify-center text-gold-500 text-xs font-bold font-display">
            {user.name?.[0]?.toUpperCase() || 'U'}
          </div>
          {open && (
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-xs font-semibold text-light-text dark:text-dark-text truncate">{user.name}</p>
              <p className="text-[10px] text-light-dim dark:text-dark-dim capitalize">{user.role}</p>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}