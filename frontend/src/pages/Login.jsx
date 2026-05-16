import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { ROLES } from '../auth/AuthContext'
import AuthShowcase from '../components/AuthShowcase'

function homeForRole(role) {
  if (role === ROLES.JOB_SEEKER) return '/seeker/recommended'
  if (role === ROLES.RECRUITER) return '/recruiter/jobs'
  if (role === ROLES.ADMIN) return '/admin/analytics'
  return '/'
}

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const loc = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')

  if (user) return <Navigate to={loc.state?.from || homeForRole(user.role)} replace />

  async function onSubmit(e) {
    e.preventDefault()
    setErr('')
    try {
      const me = await login(email, password)
      navigate(loc.state?.from || homeForRole(me.role), { replace: true })
    } catch {
      setErr('Invalid email or password.')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-layout">
        <AuthShowcase />
        <form className="card auth-card" onSubmit={onSubmit}>
          <h1>Sign in</h1>
          <p className="muted">Use the email you registered with.</p>
          {err && <p className="error">{err}</p>}
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          <button type="submit" className="btn primary">
            Sign in
          </button>
          <p className="muted small">
            No account? <Link to="/register">Register</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
