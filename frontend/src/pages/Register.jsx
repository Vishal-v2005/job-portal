import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { ROLES } from '../auth/AuthContext'
import AuthShowcase from '../components/AuthShowcase'

function homeForRole(role) {
  if (role === ROLES.JOB_SEEKER) return '/seeker/recommended'
  if (role === ROLES.RECRUITER) return '/recruiter/jobs'
  if (role === ROLES.ADMIN) return '/admin/analytics'
  return '/'
}

export default function Register() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState(ROLES.JOB_SEEKER)
  const [err, setErr] = useState('')

  if (user) return <Navigate to={homeForRole(user.role)} replace />

  async function onSubmit(e) {
    e.preventDefault()
    setErr('')
    try {
      const me = await register({ username, email, password, role })
      navigate(homeForRole(me.role), { replace: true })
    } catch (ex) {
      const d = ex.response?.data
      if (d && typeof d === 'object') {
        const msg = Object.entries(d)
          .map(([k, v]) => {
            const text = Array.isArray(v) ? v.join(', ') : String(v)
            return `${k}: ${text}`
          })
          .join(' | ')
        setErr(msg || 'Registration failed.')
      } else {
        setErr('Registration failed.')
      }
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-layout">
        <AuthShowcase />
        <form className="card auth-card" onSubmit={onSubmit}>
          <h1>Create account</h1>
          {err && <p className="error">{err}</p>}
          <label>
            Username
            <input value={username} onChange={(e) => setUsername(e.target.value)} required minLength={2} />
          </label>
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          </label>
          <label>
            I am a
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value={ROLES.JOB_SEEKER}>Job seeker</option>
              <option value={ROLES.RECRUITER}>Recruiter</option>
            </select>
          </label>
          <button type="submit" className="btn primary">
            Register
          </button>
          <p className="muted small">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
