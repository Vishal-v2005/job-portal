import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Layout({ nav }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  const roleTheme = location.pathname.startsWith('/recruiter')
    ? 'theme-recruiter'
    : location.pathname.startsWith('/seeker')
      ? 'theme-seeker'
      : ''

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  function toggleTheme() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }

  return (
    <div className={`shell ${roleTheme}`}>
      <header className="topbar">
        <Link to="/" className="brand">
          Smart Job Portal
        </Link>
        <nav className="nav">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'active' : '')}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="userbox">
          <button type="button" className="btn ghost" onClick={toggleTheme}>
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          <span className="muted small">{user?.email}</span>
          <span className="pill">{user?.role?.replace('_', ' ')}</span>
          <button type="button" className="btn ghost" onClick={logout}>
            Log out
          </button>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}

export function seekerNav() {
  return [
    { to: '/seeker/recommended', label: 'For you' },
    { to: '/seeker/jobs', label: 'Browse jobs' },
    { to: '/seeker/applications', label: 'Applications' },
    { to: '/seeker/profile', label: 'Skills' },
  ]
}

export function recruiterNav() {
  return [
    { to: '/recruiter/jobs', label: 'My jobs' },
    { to: '/recruiter/jobs/new', label: 'Post job' },
    { to: '/recruiter/applications', label: 'Applications' },
  ]
}

export function adminNav() {
  return [{ to: '/admin/analytics', label: 'Analytics' }]
}
