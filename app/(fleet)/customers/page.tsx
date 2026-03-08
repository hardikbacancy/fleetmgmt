import { getFleetContext } from '@/lib/auth'
import PageHeader from '@/components/PageHeader'
import DeleteButton from '@/components/DeleteButton'
import EmptyState from '@/components/EmptyState'
import { deleteCustomer } from '@/app/actions/customers'
import { Customer } from '@/lib/types'
import { PencilIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export const revalidate = 0

export default async function CustomersPage() {
  const ctx = await getFleetContext()
  if (!ctx) return null
  const { data: customers } = await ctx.supabase
    .from('customers').select('*').eq('fleet_owner_id', ctx.fleetOwnerId).order('created_at', { ascending: false })

  return (
    <div>
      <PageHeader title="Customers" subtitle={`${(customers ?? []).length} total`} action={{ label: 'Add Customer', href: '/customers/new' }} />
      <div className="card overflow-hidden">
        {(customers ?? []).length === 0 ? (
          <EmptyState icon="👥" title="No customers yet" description="Add customers to create bookings for them." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Address</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(customers as Customer[]).map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{c.full_name}</td>
                    <td className="px-6 py-4 text-gray-600">{c.phone}</td>
                    <td className="px-6 py-4 text-gray-500">{c.email ?? '—'}</td>
                    <td className="px-6 py-4 text-gray-500 max-w-[200px] truncate">{c.address ?? '—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/customers/${c.id}/edit`} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <PencilIcon className="w-4 h-4" />
                        </Link>
                        <DeleteButton action={deleteCustomer.bind(null, c.id)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
