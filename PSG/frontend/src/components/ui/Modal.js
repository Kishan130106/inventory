import React from 'react';

export default function Modal({ title, onClose, children, footer, size = '600px' }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: size }}>
        <div className="modal-header">
          <span>{title}</span>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ fontSize: 18, padding: '2px 8px' }}>×</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
