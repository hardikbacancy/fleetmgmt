import PageHeader from '@/components/PageHeader'
import DriverForm from '@/components/forms/DriverForm'
import { createDriver } from '@/app/actions/drivers'

export default function NewDriverPage() {
  return (
    <div>
      <PageHeader title="Add Driver" backHref="/drivers" />
      <div className="card p-6 max-w-2xl">
        <DriverForm action={createDriver} />
      </div>
    </div>
  )
}
