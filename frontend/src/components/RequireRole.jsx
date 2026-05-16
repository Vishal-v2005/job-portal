import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function RequireRole({ role, children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="page center muted">
        <p>Loading…</p>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to="/" replace />
  return children
}
