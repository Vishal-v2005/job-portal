import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../api'
import JobListingCard from '../components/JobListingCard'
import PageHero from '../components/PageHero'
import StatsGrid from '../components/StatsGrid'

export default function SeekerJobs() {
  const [jobs, setJobs] = useState([])
  const [err, setErr] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await api.fetchJobs()
        if (!cancelled) setJobs(data)
      } catch {
        if (!cancelled) setErr('Could not load jobs.')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const normalizedQuery = query.trim().toLowerCase()
  const filteredJobs = useMemo(
    () =>
      jobs.filter((j) => {
        if (!normalizedQuery) return true
        const skillNames = (j.job_skills || []).map((s) => s.skill?.name || '').join(' ')
        const text = `${j.title || ''} ${j.description || ''} ${j.location || ''} ${skillNames}`.toLowerCase()
        return text.includes(normalizedQuery)
      }),
    [jobs, normalizedQuery],
  )

  const remoteCount = jobs.filter((j) => /remote/i.test(j.location || '')).length

  return (
    <div className="page page-seeker">
      <PageHero
        variant="seeker"
        title="Browse open roles"
        subtitle="Search by title, location, description, or required skills."
      >
        <Link to="/seeker/recommended" className="btn secondary">
          View recommendations
        </Link>
      </PageHero>

      <StatsGrid
        items={[
          { label: 'Open roles', value: jobs.length, hint: 'Published opportunities', tone: 'info' },
          { label: 'Search results', value: filteredJobs.length, hint: 'After keyword filter', tone: 'default' },
          { label: 'Remote-friendly', value: remoteCount, hint: 'Location includes remote', tone: 'success' },
        ]}
      />

      <section className="card filter-card">
        <label className="search-wrap">
          Search by keyword
          <input
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. react, django, remote, analyst"
          />
        </label>
      </section>

      {err && <p className="error">{err}</p>}
      <ul className="job-list">
        {filteredJobs.map((j) => (
          <JobListingCard key={j.id} job={j} to={`/seeker/jobs/${j.id}`} />
        ))}
      </ul>
      {!err && filteredJobs.length === 0 && (
        <p className="muted">No jobs match this keyword. Try a broader search.</p>
      )}
    </div>
  )
}
