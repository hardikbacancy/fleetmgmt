type Status = 'active' | 'inactive' | 'pending' | 'confirmed' | 'cancelled' |
  'in_progress' | 'completed' | 'maintenance' | 'on_trip'

const config: Record<Status, { label: string; className: string }> = {
  active:      { label: 'Active',      className: 'bg-green-100 text-green-700 ring-green-200' },
  inactive:    { label: 'Inactive',    className: 'bg-gray-100 text-gray-600 ring-gray-200' },
  pending:     { label: 'Pending',     className: 'bg-yellow-100 text-yellow-700 ring-yellow-200' },
  confirmed:   { label: 'Confirmed',   className: 'bg-blue-100 text-blue-700 ring-blue-200' },
  cancelled:   { label: 'Cancelled',   className: 'bg-red-100 text-red-700 ring-red-200' },
  in_progress: { label: 'In Progress', className: 'bg-purple-100 text-purple-700 ring-purple-200' },
  completed:   { label: 'Completed',   className: 'bg-green-100 text-green-700 ring-green-200' },
  maintenance: { label: 'Maintenance', className: 'bg-orange-100 text-orange-700 ring-orange-200' },
  on_trip:     { label: 'On Trip',     className: 'bg-blue-100 text-blue-700 ring-blue-200' },
}

export default function StatusBadge({ status }: { status: Status }) {
  const cfg = config[status] ?? { label: status, className: 'bg-gray-100 text-gray-600 ring-gray-200' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}
