'use client'

import { useActionState } from 'react'
import { ActionState, Driver } from '@/lib/types'

interface Props {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>
  initialData?: Driver
}

export default function DriverForm({ action, initialData }: Props) {
  const [state, formAction, isPending] = useActionState(action, null)

  return (
    <form action={formAction} className="space-y-5">
      {state && 'error' in state && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{state.error}</div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input name="full_name" required defaultValue={initialData?.full_name} className="input" placeholder="Ramesh Kumar" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
          <input name="phone" required defaultValue={initialData?.phone} className="input" placeholder="+91 98765 43210" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input name="email" type="email" defaultValue={initialData?.email ?? ''} className="input" placeholder="driver@email.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">License Number *</label>
          <input name="license_number" required defaultValue={initialData?.license_number} className="input" placeholder="DL0120230012345" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">License Expiry *</label>
          <input name="license_expiry" type="date" required defaultValue={initialData?.license_expiry} className="input" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select name="status" defaultValue={initialData?.status ?? 'active'} className="input">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? 'Saving…' : initialData ? 'Update Driver' : 'Add Driver'}
        </button>
        <a href="/drivers" className="btn-secondary">Cancel</a>
      </div>
    </form>
  )
}
