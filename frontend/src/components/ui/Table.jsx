// components/ui/Table.jsx
import Spinner from './Spinner'
import EmptyState from './EmptyState'
export default function Table({ columns, data, loading, emptyTitle, emptyMessage, onRowClick }) {
  if (loading) return <div className="flex items-center justify-center py-16"><Spinner /></div>
  if (!data?.length) return <EmptyState title={emptyTitle || 'No records found'} message={emptyMessage} />
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>{columns.map((col) => <th key={col.key} style={col.width ? { width: col.width } : {}}>{col.label}</th>)}</tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id || i} onClick={() => onRowClick?.(row)} className={onRowClick ? 'cursor-pointer' : ''}>
              {columns.map((col) => (
                <td key={col.key}>{col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
