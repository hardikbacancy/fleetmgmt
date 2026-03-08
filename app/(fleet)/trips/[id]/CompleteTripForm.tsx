'use client'

import { useActionState } from 'react'
import { completeTrip } from '@/app/actions/trips'
import { ActionState } from '@/lib/types'

export default function CompleteTripForm({ id, currentFare }: { id: string; currentFare: number }) {
  const boundAction = completeTrip.bind(null, id)
  const [state, formAction, isPending] = useActionState(boundAction, null as ActionState)

  return (
    <div className="card p-6">
      <h2 className="font-semibold text-gray-900 mb-4">Complete Trip</h2>
      <form action={formAction} className="space-y-4">
        {state && 'error' in state && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{state.error}</div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
            <input name="distance_km" type="number" min={0} step={0.1} className="input" placeholder="12.5" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Final Fare (₹) *</label>
            <input name="fare_amount" type="number" required min={0} step={0.01} defaultValue={currentFare || ''} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select name="payment_method" className="input">
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="online">Online</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <input name="notes" className="input" placeholder="Any remarks…" />
          </div>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={isPending}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors">
            {isPending ? 'Completing…' : '✓ Mark as Completed'}
          </button>
        </div>
      </form>
    </div>
  )
}
