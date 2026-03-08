interface Props {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export default function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="text-center py-16">
      {icon && <div className="text-5xl mb-4">{icon}</div>}
      <p className="text-gray-700 font-medium">{title}</p>
      {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
