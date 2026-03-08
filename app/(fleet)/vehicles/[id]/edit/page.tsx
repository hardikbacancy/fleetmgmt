import { getFleetContext } from '@/lib/auth'
import { notFound } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import VehicleForm from '@/components/forms/VehicleForm'
import { updateVehicle } from '@/app/actions/vehicles'

interface Props { params: Promise<{ id: string }> }

export default async function EditVehiclePage({ params }: Props) {
  const { id } = await params
  const ctx = await getFleetContext()
  if (!ctx) return null
  const { data: vehicle } = await ctx.supabase.from('vehicles').select('*').eq('id', id).eq('fleet_owner_id', ctx.fleetOwnerId).single()
  if (!vehicle) notFound()

  return (
    <div>
      <PageHeader title="Edit Vehicle" subtitle={`${vehicle.make} ${vehicle.model} · ${vehicle.plate_number}`} backHref="/vehicles" />
      <div className="card p-6 max-w-2xl">
        <VehicleForm action={updateVehicle.bind(null, id)} initialData={vehicle} />
      </div>
    </div>
  )
}
