interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && (
          <p style={{ fontSize: '0.78rem', color: 'var(--ink-3)', margin: '2px 0 0' }}>{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </header>
  )
}
