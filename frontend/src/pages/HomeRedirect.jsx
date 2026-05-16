import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { ROLES } from '../auth/AuthContext'

export default function HomeRedirect() {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="page center muted">
        <p>Loading…</p>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  if (user.role === ROLES.JOB_SEEKER) return <Navigate to="/seeker/recommended" replace />
  if (user.role === ROLES.RECRUITER) return <Navigate to="/recruiter/jobs" replace />
  if (user.role === ROLES.ADMIN) return <Navigate to="/admin/analytics" replace />
  return <Navigate to="/login" replace />
}
