import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuthStore()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">S</div>
        <p className="loading-label">Chargement…</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
