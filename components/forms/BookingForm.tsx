'use client'

import { useActionState } from 'react'
import { ActionState, Customer, Driver, Vehicle } from '@/lib/types'

interface Props {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>
  customers: Customer[]
  drivers: Driver[]
  vehicles: Vehicle[]
}

export default function BookingForm({ action, customers, drivers, vehicles }: Props) {
  const [state, formAction, isPending] = useActionState(action, null)

  const defaultDatetime = new Date(Date.now() + 3600_000).toISOString().slice(0, 16)

  return (
    <form action={formAction} className="space-y-5">
      {state && 'error' in state && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{state.error}</div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
          <select name="customer_id" required className="input">
            <option value="">Select customer…</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.full_name} — {c.phone}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Address *</label>
          <input name="pickup_address" required className="input" placeholder="123, MG Road, Bengaluru" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Drop-off Address *</label>
          <input name="dropoff_address" required className="input" placeholder="Kempegowda International Airport" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date &amp; Time *</label>
          <input name="pickup_datetime" type="datetime-local" required defaultValue={defaultDatetime} className="input" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Fare (₹)</label>
          <input name="fare_amount" type="number" min={0} step={0.01} className="input" placeholder="0.00" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assign Driver</label>
          <select name="driver_id" className="input">
            <option value="">Assign later…</option>
            {drivers.filter(d => d.status === 'active').map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assign Vehicle</label>
          <select name="vehicle_id" className="input">
            <option value="">Assign later…</option>
            {vehicles.filter(v => v.status === 'active').map(v => <option key={v.id} value={v.id}>{v.plate_number} — {v.make} {v.model}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea name="notes" rows={2} className="input" placeholder="Special instructions…" />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? 'Saving…' : 'Create Booking'}
        </button>
        <a href="/bookings" className="btn-secondary">Cancel</a>
      </div>
    </form>
  )
}
