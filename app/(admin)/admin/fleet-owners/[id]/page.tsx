import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import StatusBadge from '@/components/StatusBadge'
import PageHeader from '@/components/PageHeader'
import StatCard from '@/components/StatCard'
import { formatDate, formatCurrency } from '@/lib/utils'
import { updateFleetOwnerStatus } from '@/app/actions/admin'
import { TruckIcon, UserGroupIcon, MapPinIcon, BanknotesIcon } from '@heroicons/react/24/outline'

interface Props { params: Promise<{ id: string }> }

export const revalidate = 0

export default async function FleetOwnerDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: owner } = await supabase
    .from('fleet_owners')
    .select('*, profiles(full_name, email)')
    .eq('id', id)
    .single()

  if (!owner) notFound()

  const [{ count: vehicleCount }, { count: driverCount }, { data: trips }] = await Promise.all([
    supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('fleet_owner_id', id),
    supabase.from('drivers').select('*', { count: 'exact', head: true }).eq('fleet_owner_id', id),
    supabase.from('trips').select('fare_amount').eq('fleet_owner_id', id).eq('status', 'completed'),
  ])

  const totalRevenue = (trips ?? []).reduce((s, t) => s + (t.fare_amount ?? 0), 0)

  return (
    <div>
      <PageHeader title={owner.company_name} backHref="/admin/fleet-owners" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Details card */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-lg font-semibold text-gray-900">{(owner as { profiles?: { full_name?: string } }).profiles?.full_name ?? '—'}</p>
              <p className="text-sm text-gray-500">{(owner as { profiles?: { email?: string } }).profiles?.email ?? '—'}</p>
            </div>
            <StatusBadge status={owner.status} />
          </div>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-gray-500">Phone</dt><dd className="font-medium text-gray-900 mt-0.5">{owner.phone}</dd></div>
            <div><dt className="text-gray-500">Registered</dt><dd className="font-medium text-gray-900 mt-0.5">{formatDate(owner.created_at)}</dd></div>
            <div className="col-span-2"><dt className="text-gray-500">Address</dt><dd className="font-medium text-gray-900 mt-0.5">{owner.address ?? '—'}</dd></div>
          </dl>

          {/* Status actions */}
          <div className="flex gap-2 mt-6 pt-5 border-t border-gray-100">
            {owner.status !== 'active' && (
              <form action={updateFleetOwnerStatus.bind(null, id, 'active')}>
                <button type="submit" className="btn-primary text-xs">Activate</button>
              </form>
            )}
            {owner.status !== 'inactive' && (
              <form action={updateFleetOwnerStatus.bind(null, id, 'inactive')}>
                <button type="submit" className="btn-danger text-xs">Deactivate</button>
              </form>
            )}
            {owner.status !== 'pending' && (
              <form action={updateFleetOwnerStatus.bind(null, id, 'pending')}>
                <button type="submit" className="btn-secondary text-xs">Set Pending</button>
              </form>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <StatCard title="Vehicles" value={vehicleCount ?? 0} icon={<TruckIcon className="w-5 h-5" />} color="blue" />
          <StatCard title="Drivers" value={driverCount ?? 0} icon={<UserGroupIcon className="w-5 h-5" />} color="green" />
          <StatCard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={<BanknotesIcon className="w-5 h-5" />} color="purple" />
          <StatCard title="Trips Completed" value={(trips ?? []).length} icon={<MapPinIcon className="w-5 h-5" />} color="orange" />
        </div>
      </div>
    </div>
  )
}
