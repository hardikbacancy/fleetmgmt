'use client'

import { useActionState } from 'react'
import { ActionState, Customer } from '@/lib/types'

interface Props {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>
  initialData?: Customer
}

export default function CustomerForm({ action, initialData }: Props) {
  const [state, formAction, isPending] = useActionState(action, null)

  return (
    <form action={formAction} className="space-y-5">
      {state && 'error' in state && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{state.error}</div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input name="full_name" required defaultValue={initialData?.full_name} className="input" placeholder="Anita Sharma" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
          <input name="phone" required defaultValue={initialData?.phone} className="input" placeholder="+91 98765 43210" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input name="email" type="email" defaultValue={initialData?.email ?? ''} className="input" placeholder="customer@email.com" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input name="address" defaultValue={initialData?.address ?? ''} className="input" placeholder="42, Linking Road, Mumbai" />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? 'Saving…' : initialData ? 'Update Customer' : 'Add Customer'}
        </button>
        <a href="/customers" className="btn-secondary">Cancel</a>
      </div>
    </form>
  )
}
