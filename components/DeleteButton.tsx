'use client'

import { useState, useTransition } from 'react'
import { TrashIcon } from '@heroicons/react/24/outline'

interface Props {
  action: () => Promise<void>
  label?: string
}

export default function DeleteButton({ action, label = 'Delete' }: Props) {
  const [confirm, setConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (confirm) {
    return (
      <span className="flex items-center gap-1">
        <span className="text-xs text-gray-500 mr-1">Sure?</span>
        <button
          onClick={() => startTransition(async () => { await action(); setConfirm(false) })}
          disabled={isPending}
          className="text-xs font-semibold text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50 disabled:opacity-50"
        >
          {isPending ? '…' : 'Yes'}
        </button>
        <button onClick={() => setConfirm(false)}
          className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100">
          No
        </button>
      </span>
    )
  }

  return (
    <button onClick={() => setConfirm(true)}
      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      title={label}>
      <TrashIcon className="w-4 h-4" />
    </button>
  )
}
