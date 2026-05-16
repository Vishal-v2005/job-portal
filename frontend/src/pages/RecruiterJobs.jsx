import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../api'
import JobListingCard from '../components/JobListingCard'
import PageHero from '../components/PageHero'
import StatsGrid from '../components/StatsGrid'

export default function RecruiterJobs() {
  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [err, setErr] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [j, a] = await Promise.all([api.fetchMyJobs(), api.fetchApplications().catch(() => [])])
        if (!cancelled) {
          setJobs(j)
          setApplications(a)
        }
      } catch {
        if (!cancelled) setErr('Could not load your jobs.')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const stats = useMemo(() => {
    const published = jobs.filter((j) => j.status === 'published').length
    const draft = jobs.filter((j) => j.status === 'draft').length
    const closed = jobs.filter((j) => j.status === 'closed').length
    return { published, draft, closed }
  }, [jobs])

  return (
    <div className="page page-recruiter">
      <PageHero
        variant="recruiter"
        title="Your job posts"
        subtitle="Manage listings, track status, and review candidate matches per role."
      >
        <Link to="/recruiter/jobs/new" className="btn primary">
          Post new job
        </Link>
        <Link to="/recruiter/applications" className="btn secondary">
          View applications
        </Link>
      </PageHero>

      <StatsGrid
        items={[
          { label: 'Total posts', value: jobs.length, hint: 'All statuses', tone: 'info' },
          { label: 'Published', value: stats.published, hint: 'Visible to seekers', tone: 'success' },
          { label: 'Draft', value: stats.draft, hint: 'Not yet live', tone: 'warn' },
          { label: 'Applications', value: applications.length, hint: 'Across your jobs', tone: 'default' },
        ]}
      />

      {err && <p className="error">{err}</p>}

      {!err && jobs.length === 0 && (
        <section className="card tip-card">
          <h2>Start hiring</h2>
          <p className="muted">Create your first job post with required skills to unlock candidate matching.</p>
          <Link to="/recruiter/jobs/new" className="btn primary">
            Create job
          </Link>
        </section>
      )}

      <ul className="job-list">
        {jobs.map((j) => (
          <JobListingCard
            key={j.id}
            job={j}
            to={`/recruiter/jobs/${j.id}`}
            showStatus
            actions={
              <>
                <Link className="btn secondary small" to={`/recruiter/jobs/${j.id}/edit`}>
                  Edit
                </Link>
                <Link className="btn ghost small" to={`/recruiter/jobs/${j.id}`}>
                  View details
                </Link>
              </>
            }
          />
        ))}
      </ul>
    </div>
  )
}
