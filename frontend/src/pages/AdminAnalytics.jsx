import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import * as api from '../api'

export default function AdminAnalytics() {
  const [data, setData] = useState(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const d = await api.fetchAnalyticsSummary()
        setData(d)
      } catch {
        setErr('Analytics available to admin role only. Set role to admin in Django admin for your user.')
      }
    })()
  }, [])

  if (err) {
    return (
      <div className="page">
        <h1>Admin analytics</h1>
        <p className="error">{err}</p>
      </div>
    )
  }
  if (!data) return <p className="muted">Loading…</p>

  const users = (data.users_by_role || []).map((r) => ({
    name: r.role,
    count: r.count,
  }))
  const apps = (data.applications_by_status || []).map((r) => ({
    name: r.status,
    count: r.count,
  }))

  return (
    <div className="page">
      <h1>Analytics</h1>
      <p className="muted">Aggregated portal metrics.</p>
      <div className="charts">
        <section className="card chart-card">
          <h2>Users by role</h2>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={users}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Users" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="card chart-card">
          <h2>Applications by status</h2>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={apps}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Applications" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
      <section className="card mt">
        <h2>Jobs by status</h2>
        <ul className="kv">
          {(data.jobs_by_status || []).map((r) => (
            <li key={r.status}>
              <span>{r.status}</span>
              <strong>{r.count}</strong>
            </li>
          ))}
        </ul>
      </section>
      <section className="grid-2 mt">
        <div className="card">
          <h3>Top skills (on jobs)</h3>
          <ol>
            {(data.top_skills_on_jobs || []).map((r) => (
              <li key={r.name}>
                {r.name} — {r.job_count}
              </li>
            ))}
          </ol>
        </div>
        <div className="card">
          <h3>Top skills (seekers)</h3>
          <ol>
            {(data.top_skills_on_seekers || []).map((r) => (
              <li key={r.name}>
                {r.name} — {r.seeker_count}
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  )
}
