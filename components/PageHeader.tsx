import Link from 'next/link'

interface Props {
  title: string
  subtitle?: string
  action?: { label: string; href: string }
  backHref?: string
}

export default function PageHeader({ title, subtitle, action, backHref }: Props) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        {backHref && (
          <Link href={backHref} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
        )}
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {action && (
        <Link href={action.href}
          className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {action.label}
        </Link>
      )}
    </div>
  )
}
