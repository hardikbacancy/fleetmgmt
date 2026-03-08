import { getFleetContext } from '@/lib/auth'
import PageHeader from '@/components/PageHeader'
import ExpenseForm from '@/components/forms/ExpenseForm'
import { createExpense } from '@/app/actions/expenses'

export default async function NewExpensePage() {
  const ctx = await getFleetContext()
  if (!ctx) return null

  const [{ data: vehicles }, { data: drivers }] = await Promise.all([
    ctx.supabase.from('vehicles').select('*').eq('fleet_owner_id', ctx.fleetOwnerId).order('plate_number'),
    ctx.supabase.from('drivers').select('*').eq('fleet_owner_id', ctx.fleetOwnerId).order('full_name'),
  ])

  return (
    <div>
      <PageHeader title="Add Expense" backHref="/expenses" />
      <div className="card p-6 max-w-2xl">
        <ExpenseForm action={createExpense} vehicles={vehicles ?? []} drivers={drivers ?? []} />
      </div>
    </div>
  )
}
