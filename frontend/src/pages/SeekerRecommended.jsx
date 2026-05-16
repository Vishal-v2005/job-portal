import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../api'
import JobListingCard from '../components/JobListingCard'
import PageHero from '../components/PageHero'
import StatsGrid from '../components/StatsGrid'

export default function SeekerRecommended() {
  const [jobs, setJobs] = useState([])
  const [profile, setProfile] = useState(null)
  const [applications, setApplications] = useState([])
  const [err, setErr] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [recs, prof, apps] = await Promise.all([
          api.fetchRecommendedJobs(),
          api.fetchSeekerProfile().catch(() => null),
          api.fetchApplications().catch(() => []),
        ])
        if (!cancelled) {
          setJobs(recs)
          setProfile(prof)
          setApplications(apps)
        }
      } catch {
        if (!cancelled) setErr('Could not load recommendations.')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const skillCount = profile?.skills?.length ?? 0
  const topMatch = jobs.length ? Math.round((jobs[0].match_score || 0) * 100) : 0

  return (
    <div className="page page-seeker">
      <PageHero
        variant="seeker"
        title="Recommended for you"
        subtitle="Roles ranked by how well your saved skills overlap with each job's requirements."
      >
        <Link to="/seeker/profile" className="btn secondary">
          Update skills
        </Link>
        <Link to="/seeker/jobs" className="btn primary">
          Browse all jobs
        </Link>
      </PageHero>

      <StatsGrid
        items={[
          { label: 'Matches found', value: jobs.length, hint: 'Based on your profile', tone: 'info' },
          { label: 'Skills saved', value: skillCount, hint: 'More skills = better matches', tone: 'success' },
          { label: 'Applications', value: applications.length, hint: 'Track status anytime', tone: 'default' },
          { label: 'Top match', value: jobs.length ? `${topMatch}%` : '—', hint: 'Highest overlap score', tone: 'info' },
        ]}
      />

      {err && <p className="error">{err}</p>}

      {!err && jobs.length === 0 && (
        <section className="card tip-card">
          <h2>Improve your recommendations</h2>
          <p className="muted">Add at least 5 skills on your profile so the matcher can score jobs accurately.</p>
          <Link to="/seeker/profile" className="btn primary">
            Go to Skills
          </Link>
        </section>
      )}

      <ul className="job-list">
        {jobs.map((j) => (
          <JobListingCard
            key={j.id}
            job={j}
            to={`/seeker/jobs/${j.id}`}
            matchScore={j.match_score}
          />
        ))}
      </ul>
    </div>
  )
}
