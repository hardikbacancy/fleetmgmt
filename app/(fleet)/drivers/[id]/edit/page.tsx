import { getFleetContext } from '@/lib/auth'
import { notFound } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import DriverForm from '@/components/forms/DriverForm'
import { updateDriver } from '@/app/actions/drivers'

interface Props { params: Promise<{ id: string }> }

export default async function EditDriverPage({ params }: Props) {
  const { id } = await params
  const ctx = await getFleetContext()
  if (!ctx) return null
  const { data: driver } = await ctx.supabase.from('drivers').select('*').eq('id', id).eq('fleet_owner_id', ctx.fleetOwnerId).single()
  if (!driver) notFound()

  return (
    <div>
      <PageHeader title="Edit Driver" subtitle={driver.full_name} backHref="/drivers" />
      <div className="card p-6 max-w-2xl">
        <DriverForm action={updateDriver.bind(null, id)} initialData={driver} />
      </div>
    </div>
  )
}
