import PageHeader from '@/components/PageHeader'
import CustomerForm from '@/components/forms/CustomerForm'
import { createCustomer } from '@/app/actions/customers'

export default function NewCustomerPage() {
  return (
    <div>
      <PageHeader title="Add Customer" backHref="/customers" />
      <div className="card p-6 max-w-2xl">
        <CustomerForm action={createCustomer} />
      </div>
    </div>
  )
}
