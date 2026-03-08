import { getFleetContext } from '@/lib/auth'
import { notFound } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import CustomerForm from '@/components/forms/CustomerForm'
import { updateCustomer } from '@/app/actions/customers'

interface Props { params: Promise<{ id: string }> }

export default async function EditCustomerPage({ params }: Props) {
  const { id } = await params
  const ctx = await getFleetContext()
  if (!ctx) return null
  const { data: customer } = await ctx.supabase.from('customers').select('*').eq('id', id).eq('fleet_owner_id', ctx.fleetOwnerId).single()
  if (!customer) notFound()

  return (
    <div>
      <PageHeader title="Edit Customer" subtitle={customer.full_name} backHref="/customers" />
      <div className="card p-6 max-w-2xl">
        <CustomerForm action={updateCustomer.bind(null, id)} initialData={customer} />
      </div>
    </div>
  )
}
