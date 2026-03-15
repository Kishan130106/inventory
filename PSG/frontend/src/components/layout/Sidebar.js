import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { label: 'Dashboard', icon: '📊', path: '/dashboard', section: 'Main' },
  { label: 'Products', icon: '📦', path: '/products', section: 'Inventory' },
  { label: 'Receipts', icon: '📥', path: '/receipts', section: 'Operations' },
  { label: 'Deliveries', icon: '📤', path: '/deliveries', section: 'Operations' },
  { label: 'Transfers', icon: '🔄', path: '/transfers', section: 'Operations' },
  { label: 'Adjustments', icon: '⚖️', path: '/adjustments', section: 'Operations' },
  { label: 'Move History', icon: '📋', path: '/move-history', section: 'Reports' },
  { label: 'Settings', icon: '⚙️', path: '/settings', section: 'Config' },
];

const sections = ['Main', 'Inventory', 'Operations', 'Reports', 'Config'];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="brand"><span>PSG</span> Inventory</div>
        <div className="sub">Patel Sports & Goods</div>
      </div>

      <nav className="sidebar-nav">
        {sections.map(section => {
          const items = navItems.filter(i => i.section === section);
          if (!items.length) return null;
          return (
            <div key={section}>
              <div className="nav-section-label">{section}</div>
              {items.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                >
                  <span className="icon">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="nav-item" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
          <span className="icon">👤</span>
          <div>
            <div style={{ color: '#fff', fontWeight: 600 }}>{user?.first_name} {user?.last_name}</div>
            <div style={{ fontSize: 11 }}>{user?.email}</div>
          </div>
        </div>
        <div className="nav-item" onClick={handleLogout} style={{ cursor: 'pointer', color: '#e94560' }}>
          <span className="icon">🚪</span>
          Logout
        </div>
      </div>
    </aside>
  );
}
