'use client'

import { useActionState } from 'react'
import { ActionState, Vehicle } from '@/lib/types'

interface Props {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>
  initialData?: Vehicle
}

export default function VehicleForm({ action, initialData }: Props) {
  const [state, formAction, isPending] = useActionState(action, null)

  return (
    <form action={formAction} className="space-y-5">
      {state && 'error' in state && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{state.error}</div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Make *</label>
          <input name="make" required defaultValue={initialData?.make} className="input" placeholder="Maruti, Honda, Toyota…" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
          <input name="model" required defaultValue={initialData?.model} className="input" placeholder="Swift, City, Innova…" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
          <input name="year" type="number" required min={2000} max={2030}
            defaultValue={initialData?.year ?? new Date().getFullYear()} className="input" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Plate Number *</label>
          <input name="plate_number" required defaultValue={initialData?.plate_number} className="input" placeholder="DL01AB1234" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select name="type" defaultValue={initialData?.type ?? 'sedan'} className="input">
            <option value="sedan">Sedan</option>
            <option value="suv">SUV</option>
            <option value="hatchback">Hatchback</option>
            <option value="minivan">Minivan</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Color *</label>
          <input name="color" required defaultValue={initialData?.color} className="input" placeholder="White, Silver, Black…" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select name="status" defaultValue={initialData?.status ?? 'active'} className="input">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? 'Saving…' : initialData ? 'Update Vehicle' : 'Add Vehicle'}
        </button>
        <a href="/vehicles" className="btn-secondary">Cancel</a>
      </div>
    </form>
  )
}
