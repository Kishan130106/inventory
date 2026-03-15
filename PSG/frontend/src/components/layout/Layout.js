import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/products': 'Products',
  '/receipts': 'Receipts',
  '/deliveries': 'Delivery Orders',
  '/transfers': 'Internal Transfers',
  '/adjustments': 'Stock Adjustments',
  '/move-history': 'Move History',
  '/settings': 'Settings',
  '/profile': 'My Profile',
};

export default function Layout() {
  const { user } = useAuth();
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'PSG Inventory';
  const initials = user ? `${user.first_name?.[0]}${user.last_name?.[0]}` : 'U';

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <header className="topbar">
          <div className="topbar-title">{title}</div>
          <div className="topbar-user">
            <span style={{ fontSize: 12, color: 'var(--text2)' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <div className="avatar">{initials.toUpperCase()}</div>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
