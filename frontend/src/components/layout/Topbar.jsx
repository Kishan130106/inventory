// components/layout/Topbar.jsx
import { useDispatch, useSelector } from 'react-redux'
import { Menu, Bell, LogOut, ChevronDown, Sun, Moon } from 'lucide-react'
import { toggleSidebar } from '../../store/uiSlice'
import { toggleTheme, selectTheme } from '../../store/themeSlice'
import { selectUser } from '../../store/authSlice'
import { useAuth } from '../../hooks/useAuth'
import { useState } from 'react'

export default function Topbar({ title, subtitle }) {
  const dispatch   = useDispatch()
  const user       = useSelector(selectUser)
  const theme      = useSelector(selectTheme)
  const { signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="h-14 dark:bg-dark-surface light:bg-light-surface
                       dark:border-dark-border light:border-light-border
                       border-b flex items-center px-4 gap-4 shrink-0">
      <button onClick={() => dispatch(toggleSidebar())}
        className="p-1.5 rounded-md dark:text-dark-sub light:text-light-sub
                   dark:hover:bg-dark-muted light:hover:bg-light-muted
                   dark:hover:text-dark-text light:hover:text-light-text transition-colors">
        <Menu size={18} />
      </button>

      <div className="flex-1 min-w-0">
        {title    && <h2 className="font-display font-bold text-base tracking-tight dark:text-white light:text-light-text truncate leading-none">{title}</h2>}
        {subtitle && <p className="text-xs dark:text-dark-dim light:text-light-dim leading-none mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <button onClick={() => dispatch(toggleTheme())}
          className="p-1.5 rounded-md dark:text-dark-sub light:text-light-sub
                     dark:hover:bg-dark-muted light:hover:bg-light-muted transition-colors">
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button className="p-1.5 rounded-md dark:text-dark-sub light:text-light-sub
                           dark:hover:bg-dark-muted light:hover:bg-light-muted transition-colors">
          <Bell size={16} />
        </button>

        {/* User menu */}
        <div className="relative ml-1">
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md
                       dark:hover:bg-dark-muted light:hover:bg-light-muted transition-colors">
            <div className="w-7 h-7 rounded-lg bg-gold-500/20 border border-gold-500/30
                            flex items-center justify-center text-gold-500 text-xs font-display font-bold">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="text-sm dark:text-dark-sub light:text-light-sub hidden sm:block font-medium">
              {user?.name?.split(' ')[0]}
            </span>
            <ChevronDown size={12} className="dark:text-dark-dim light:text-light-dim" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1.5 w-48
                              dark:bg-dark-card dark:border-dark-border
                              light:bg-light-card light:border-light-border
                              border rounded-xl shadow-2xl z-20 overflow-hidden">
                <div className="px-3 py-2.5 dark:border-dark-border light:border-light-border border-b">
                  <p className="text-xs font-semibold dark:text-white light:text-light-text truncate">{user?.name}</p>
                  <p className="text-[11px] dark:text-dark-dim light:text-light-dim capitalize mt-0.5">{user?.role}</p>
                </div>
                <button onClick={signOut}
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-sm
                             dark:text-dark-sub light:text-light-sub
                             hover:text-red-400 dark:hover:bg-dark-muted light:hover:bg-light-muted
                             transition-colors">
                  <LogOut size={14} />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
