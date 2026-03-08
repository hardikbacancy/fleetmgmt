'use client'

import { useActionState } from 'react'
import { ActionState, Vehicle, Driver } from '@/lib/types'

interface Props {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>
  vehicles: Vehicle[]
  drivers: Driver[]
}

const CATEGORIES = [
  { value: 'fuel', label: 'Fuel' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'salary', label: 'Salary' },
  { value: 'tolls', label: 'Tolls' },
  { value: 'other', label: 'Other' },
]

export default function ExpenseForm({ action, vehicles, drivers }: Props) {
  const [state, formAction, isPending] = useActionState(action, null)
  const today = new Date().toISOString().split('T')[0]

  return (
    <form action={formAction} className="space-y-5">
      {state && 'error' in state && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{state.error}</div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <select name="category" required className="input">
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
          <input name="amount" type="number" required min={0} step={0.01} className="input" placeholder="0.00" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <input name="description" required className="input" placeholder="e.g. Fuel refill at BPCL Koramangala" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
          <input name="date" type="date" required defaultValue={today} className="input" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Related Vehicle</label>
          <select name="vehicle_id" className="input">
            <option value="">None</option>
            {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate_number} — {v.make} {v.model}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Related Driver</label>
          <select name="driver_id" className="input">
            <option value="">None</option>
            {drivers.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? 'Saving…' : 'Add Expense'}
        </button>
        <a href="/expenses" className="btn-secondary">Cancel</a>
      </div>
    </form>
  )
}
