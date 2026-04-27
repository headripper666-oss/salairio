interface SkeletonProps {
  width?: string | number
  height?: string | number
  className?: string
  style?: React.CSSProperties
}

export function Skeleton({ width, height = 16, className = '', style }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, ...style }}
      aria-hidden="true"
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="card" style={{ padding: '1rem' }}>
      <Skeleton width="40%" height={11} style={{ marginBottom: 12 }} />
      <Skeleton width="60%" height={28} style={{ marginBottom: 8 }} />
      <Skeleton width="80%" height={11} />
    </div>
  )
}
