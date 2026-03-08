'use client'

import { useActionState } from 'react'
import { ActionState, Driver, Vehicle } from '@/lib/types'

interface Props {
  bookingId: string
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>
  drivers: Driver[]
  vehicles: Vehicle[]
  currentDriverId: string | null
  currentVehicleId: string | null
  currentFare: number | null
  currentNotes: string | null
}

export default function AssignForm({ action, drivers, vehicles, currentDriverId, currentVehicleId, currentFare, currentNotes }: Props) {
  const [state, formAction, isPending] = useActionState(action, null)

  return (
    <form action={formAction} className="space-y-4">
      {state && 'error' in state && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{state.error}</div>
      )}
      {state && 'success' in state && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">Assignment updated.</div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
          <select name="driver_id" defaultValue={currentDriverId ?? ''} className="input">
            <option value="">Assign later…</option>
            {drivers.map(d => <option key={d.id} value={d.id}>{d.full_name} ({d.status})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
          <select name="vehicle_id" defaultValue={currentVehicleId ?? ''} className="input">
            <option value="">Assign later…</option>
            {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate_number} — {v.make} {v.model}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fare (₹)</label>
          <input name="fare_amount" type="number" min={0} step={0.01} defaultValue={currentFare ?? ''} className="input" placeholder="0.00" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <input name="notes" defaultValue={currentNotes ?? ''} className="input" placeholder="Special instructions…" />
        </div>
      </div>
      <button type="submit" disabled={isPending} className="btn-primary">
        {isPending ? 'Saving…' : 'Update Assignment'}
      </button>
    </form>
  )
}
