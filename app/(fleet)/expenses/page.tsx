import { getFleetContext } from '@/lib/auth'
import PageHeader from '@/components/PageHeader'
import DeleteButton from '@/components/DeleteButton'
import EmptyState from '@/components/EmptyState'
import { deleteExpense } from '@/app/actions/expenses'
import { Expense } from '@/lib/types'
import { formatDate, formatCurrency } from '@/lib/utils'

export const revalidate = 0

const CATEGORY_LABELS: Record<string, string> = {
  fuel: 'Fuel', maintenance: 'Maintenance', insurance: 'Insurance',
  salary: 'Salary', tolls: 'Tolls', other: 'Other',
}
const CATEGORY_COLORS: Record<string, string> = {
  fuel: 'bg-orange-100 text-orange-700', maintenance: 'bg-blue-100 text-blue-700',
  insurance: 'bg-purple-100 text-purple-700', salary: 'bg-green-100 text-green-700',
  tolls: 'bg-yellow-100 text-yellow-700', other: 'bg-gray-100 text-gray-600',
}

export default async function ExpensesPage() {
  const ctx = await getFleetContext()
  if (!ctx) return null

  const { data: expenses } = await ctx.supabase
    .from('expenses')
    .select('*, vehicles(plate_number, make, model), drivers(full_name)')
    .eq('fleet_owner_id', ctx.fleetOwnerId)
    .order('date', { ascending: false })

  const total = (expenses ?? []).reduce((s, e) => s + (e.amount ?? 0), 0)

  return (
    <div>
      <PageHeader title="Expenses" subtitle={`Total: ${formatCurrency(total)}`} action={{ label: 'Add Expense', href: '/expenses/new' }} />
      <div className="card overflow-hidden">
        {(expenses ?? []).length === 0 ? (
          <EmptyState icon="💰" title="No expenses yet" description="Track fuel, maintenance, and other costs." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Vehicle / Driver</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(expenses as (Expense & { vehicles: { plate_number: string; make: string; model: string } | null; drivers: { full_name: string } | null })[]).map(e => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{formatDate(e.date)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${CATEGORY_COLORS[e.category] ?? 'bg-gray-100 text-gray-600'}`}>
                        {CATEGORY_LABELS[e.category] ?? e.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700 max-w-[200px] truncate">{e.description}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {e.vehicles ? `${e.vehicles.plate_number}` : ''}
                      {e.drivers ? ` ${e.drivers.full_name}` : ''}
                      {!e.vehicles && !e.drivers ? '—' : ''}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{formatCurrency(e.amount)}</td>
                    <td className="px-6 py-4 flex justify-end">
                      <DeleteButton action={deleteExpense.bind(null, e.id)} />
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
