import PageHeader from '@/components/PageHeader'
import VehicleForm from '@/components/forms/VehicleForm'
import { createVehicle } from '@/app/actions/vehicles'

export default function NewVehiclePage() {
  return (
    <div>
      <PageHeader title="Add Vehicle" backHref="/vehicles" />
      <div className="card p-6 max-w-2xl">
        <VehicleForm action={createVehicle} />
      </div>
    </div>
  )
}
