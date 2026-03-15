// utils/formatDate.js

/**
 * "15 Mar 2026"
 */
export const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

/**
 * "15 Mar 2026, 2:30 PM"
 */
export const formatDateTime = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

/**
 * "2 hours ago" / "3 days ago"
 */
export const timeAgo = (date) => {
  if (!date) return '—'
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000)
  const intervals = [
    { label: 'year',   secs: 31536000 },
    { label: 'month',  secs: 2592000  },
    { label: 'day',    secs: 86400    },
    { label: 'hour',   secs: 3600     },
    { label: 'minute', secs: 60       },
  ]
  for (const { label, secs } of intervals) {
    const count = Math.floor(seconds / secs)
    if (count >= 1) return `${count} ${label}${count > 1 ? 's' : ''} ago`
  }
  return 'just now'
}
