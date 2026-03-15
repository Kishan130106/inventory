import React from 'react';

export default function StatusBadge({ status }) {
  const map = {
    Draft: 'badge-draft',
    Waiting: 'badge-waiting',
    Ready: 'badge-ready',
    Done: 'badge-done',
    Canceled: 'badge-canceled',
  };
  return <span className={`badge ${map[status] || 'badge-draft'}`}>{status}</span>;
}
