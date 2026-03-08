import { getFleetContext } from '@/lib/auth'
import StatCard from '@/components/StatCard'
import { formatCurrency } from '@/lib/utils'
import { BanknotesIcon, MapPinIcon, TruckIcon, UserGroupIcon } from '@heroicons/react/24/outline'

export const revalidate = 0

const CATEGORY_LABELS: Record<string, string> = {
  fuel: 'Fuel', maintenance: 'Maintenance', insurance: 'Insurance',
  salary: 'Salary', tolls: 'Tolls', other: 'Other',
}

export default async function ReportsPage() {
  const ctx = await getFleetContext()
  if (!ctx) return null
  const { fleetOwnerId, supabase } = ctx

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const last30 = new Date(Date.now() - 30 * 86400_000).toISOString()

  const [
    { data: allTrips },
    { data: monthTrips },
    { data: allExpenses },
    { data: monthExpenses },
    { data: drivers },
  ] = await Promise.all([
    supabase.from('trips').select('fare_amount, status, driver_id, drivers(full_name)').eq('fleet_owner_id', fleetOwnerId),
    supabase.from('trips').select('fare_amount, status').eq('fleet_owner_id', fleetOwnerId).gte('completed_at', monthStart).eq('status', 'completed'),
    supabase.from('expenses').select('amount, category').eq('fleet_owner_id', fleetOwnerId).gte('date', last30.split('T')[0]),
    supabase.from('expenses').select('amount').eq('fleet_owner_id', fleetOwnerId).gte('date', monthStart.split('T')[0]),
    supabase.from('drivers').select('id, full_name').eq('fleet_owner_id', fleetOwnerId),
  ])

  const totalRevenue   = (allTrips ?? []).filter(t => t.status === 'completed').reduce((s, t) => s + (t.fare_amount ?? 0), 0)
  const monthRevenue   = (monthTrips ?? []).reduce((s, t) => s + (t.fare_amount ?? 0), 0)
  const totalExpenses  = (allExpenses ?? []).reduce((s, e) => s + (e.amount ?? 0), 0)
  const monthExpTotal  = (monthExpenses ?? []).reduce((s, e) => s + (e.amount ?? 0), 0)
  const netProfit      = monthRevenue - monthExpTotal

  const completed  = (allTrips ?? []).filter(t => t.status === 'completed').length
  const inProgress = (allTrips ?? []).filter(t => t.status === 'in_progress').length
  const cancelled  = (allTrips ?? []).filter(t => t.status === 'cancelled').length
  const totalTrips = (allTrips ?? []).length

  // Driver leaderboard
  const driverMap: Record<string, { name: string; trips: number; revenue: number }> = {}
  for (const t of allTrips ?? []) {
    if (t.status !== 'completed' || !t.driver_id) continue
    if (!driverMap[t.driver_id]) {
      const d = (drivers ?? []).find(d => d.id === t.driver_id)
      driverMap[t.driver_id] = { name: d?.full_name ?? 'Unknown', trips: 0, revenue: 0 }
    }
    driverMap[t.driver_id].trips++
    driverMap[t.driver_id].revenue += t.fare_amount ?? 0
  }
  const topDrivers = Object.values(driverMap).sort((a, b) => b.trips - a.trips).slice(0, 5)

  // Expense breakdown
  const expByCategory: Record<string, number> = {}
  for (const e of allExpenses ?? []) {
    expByCategory[e.category] = (expByCategory[e.category] || 0) + (e.amount ?? 0)
  }
  const sortedCategories = Object.entries(expByCategory).sort((a, b) => b[1] - a[1])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Reports</h1>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="Revenue This Month" value={formatCurrency(monthRevenue)} icon={<BanknotesIcon className="w-5 h-5" />} color="green" />
        <StatCard title="Net Profit (Month)" value={formatCurrency(netProfit)} subtitle="Revenue − Expenses" icon={<BanknotesIcon className="w-5 h-5" />} color={netProfit >= 0 ? 'blue' : 'red'} />
        <StatCard title="Total Trips" value={totalTrips} subtitle={`${completed} completed`} icon={<MapPinIcon className="w-5 h-5" />} color="purple" />
        <StatCard title="Total Revenue" value={formatCurrency(totalRevenue)} subtitle="All time" icon={<BanknotesIcon className="w-5 h-5" />} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Trip Status Breakdown */}
        <div className="card p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Trip Status Breakdown</h2>
          <div className="space-y-3">
            {[
              { label: 'Completed', count: completed, color: 'bg-green-500' },
              { label: 'In Progress', count: inProgress, color: 'bg-purple-500' },
              { label: 'Cancelled', count: cancelled, color: 'bg-red-400' },
            ].map(row => (
              <div key={row.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{row.label}</span>
                  <span className="font-semibold text-gray-900">{row.count} ({totalTrips ? Math.round(row.count / totalTrips * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`${row.color} h-2 rounded-full transition-all`}
                    style={{ width: totalTrips ? `${(row.count / totalTrips) * 100}%` : '0%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* P&L */}
        <div className="card p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">P&amp;L — Last 30 Days</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Revenue</span>
              <span className="font-bold text-green-600 text-lg">{formatCurrency(monthRevenue)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Expenses</span>
              <span className="font-bold text-red-600 text-lg">− {formatCurrency(totalExpenses)}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="font-semibold text-gray-900">Net</span>
              <span className={`font-bold text-xl ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netProfit)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Drivers */}
        <div className="card p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Top Drivers</h2>
          {topDrivers.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No completed trips yet.</p>
          ) : (
            <div className="space-y-3">
              {topDrivers.map((d, i) => (
                <div key={d.name} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{d.name}</p>
                    <p className="text-xs text-gray-500">{d.trips} trips · {formatCurrency(d.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expense Breakdown */}
        <div className="card p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Expense Breakdown (30 days)</h2>
          {sortedCategories.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No expenses recorded.</p>
          ) : (
            <div className="space-y-3">
              {sortedCategories.map(([cat, amt]) => (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{CATEGORY_LABELS[cat] ?? cat}</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(amt)}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full"
                      style={{ width: `${(amt / totalExpenses) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
