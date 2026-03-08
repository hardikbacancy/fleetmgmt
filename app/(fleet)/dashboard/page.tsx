import { createClient } from '@/lib/supabase/server'
import { getFleetContext } from '@/lib/auth'
import StatCard from '@/components/StatCard'
import StatusBadge from '@/components/StatusBadge'
import { formatDateTime, formatCurrency } from '@/lib/utils'
import { TruckIcon, UserGroupIcon, CalendarIcon, BanknotesIcon, MapPinIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import type { Booking, Trip } from '@/lib/types'

export const revalidate = 0

export default async function DashboardPage() {
  const ctx = await getFleetContext()
  if (!ctx) return null
  const { supabase, fleetOwnerId } = ctx

  const today = new Date()
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()

  const [
    { count: vehicleCount },
    { count: driverCount },
    { count: activeTrips },
    { data: bookingsToday },
    { data: recentBookings },
    { data: recentTrips },
    { data: monthTrips },
  ] = await Promise.all([
    supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('fleet_owner_id', fleetOwnerId).eq('status', 'active'),
    supabase.from('drivers').select('*', { count: 'exact', head: true }).eq('fleet_owner_id', fleetOwnerId).eq('status', 'active'),
    supabase.from('trips').select('*', { count: 'exact', head: true }).eq('fleet_owner_id', fleetOwnerId).eq('status', 'in_progress'),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('fleet_owner_id', fleetOwnerId).gte('created_at', new Date().toISOString().split('T')[0]),
    supabase.from('bookings').select('*, customers(full_name)').eq('fleet_owner_id', fleetOwnerId).order('created_at', { ascending: false }).limit(5),
    supabase.from('trips').select('*, drivers(full_name), vehicles(plate_number)').eq('fleet_owner_id', fleetOwnerId).eq('status', 'in_progress').limit(3),
    supabase.from('trips').select('fare_amount').eq('fleet_owner_id', fleetOwnerId).eq('status', 'completed').gte('completed_at', monthStart),
  ])

  const monthRevenue = (monthTrips ?? []).reduce((s, t) => s + (t.fare_amount ?? 0), 0)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="Active Vehicles" value={vehicleCount ?? 0} icon={<TruckIcon className="w-5 h-5" />} color="blue" />
        <StatCard title="Active Drivers" value={driverCount ?? 0} icon={<UserGroupIcon className="w-5 h-5" />} color="green" />
        <StatCard title="Trips In Progress" value={activeTrips ?? 0} icon={<MapPinIcon className="w-5 h-5" />} color="purple" />
        <StatCard title="Revenue This Month" value={formatCurrency(monthRevenue)} icon={<BanknotesIcon className="w-5 h-5" />} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Recent Bookings</h2>
            <Link href="/bookings" className="text-sm text-blue-600 hover:text-blue-700">View all →</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {(recentBookings ?? []).length === 0 && (
              <p className="px-6 py-8 text-sm text-gray-400 text-center">No bookings yet.</p>
            )}
            {(recentBookings ?? []).map((b: Booking & { customers: { full_name: string } | null }) => (
              <div key={b.id} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{b.customers?.full_name ?? 'Unknown'}</p>
                  <p className="text-xs text-gray-500 truncate max-w-[200px]">{b.pickup_address} → {b.dropoff_address}</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Active Trips */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Active Trips</h2>
            <Link href="/trips" className="text-sm text-blue-600 hover:text-blue-700">View all →</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {(recentTrips ?? []).length === 0 && (
              <p className="px-6 py-8 text-sm text-gray-400 text-center">No active trips.</p>
            )}
            {(recentTrips ?? []).map((t: Trip & { drivers: { full_name: string } | null; vehicles: { plate_number: string } | null }) => (
              <div key={t.id} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{t.drivers?.full_name ?? '—'}</p>
                  <p className="text-xs text-gray-500">{t.vehicles?.plate_number} · {formatDateTime(t.started_at)}</p>
                </div>
                <StatusBadge status={t.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
