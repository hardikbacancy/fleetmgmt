interface Props {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'orange'
}

const colorMap = {
  blue:   'bg-blue-50 text-blue-600',
  green:  'bg-green-50 text-green-600',
  yellow: 'bg-yellow-50 text-yellow-600',
  red:    'bg-red-50 text-red-600',
  purple: 'bg-purple-50 text-purple-600',
  orange: 'bg-orange-50 text-orange-600',
}

export default function StatCard({ title, value, subtitle, icon, color = 'blue' }: Props) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  )
}
