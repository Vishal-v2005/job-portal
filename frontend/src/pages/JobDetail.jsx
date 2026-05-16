import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as api from '../api'
import { useAuth } from '../auth/AuthContext'
import { ROLES } from '../auth/AuthContext'
import PageHero from '../components/PageHero'
import { formatDate, statusTone } from '../utils/jobDisplay'

export default function JobDetail({ mode = 'seeker' }) {
  const { jobId } = useParams()
  const id = jobId
  const { user } = useAuth()
  const [job, setJob] = useState(null)
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')
  const [candidates, setCandidates] = useState(null)
  const [resumeFile, setResumeFile] = useState(null)

  const isSeeker = mode === 'seeker'
  const pageClass = isSeeker ? 'page-seeker' : 'page-recruiter'

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const j = await api.fetchJob(id)
        if (!cancelled) setJob(j)
        if (mode === 'recruiter' && user?.role === ROLES.RECRUITER) {
          try {
            const c = await api.fetchRecommendedCandidates(id)
            if (!cancelled) setCandidates(c)
          } catch {
            if (!cancelled) setCandidates([])
          }
        }
      } catch {
        if (!cancelled) setErr('Job not found.')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [jobId, mode, user, id])

  async function apply() {
    setErr('')
    setMsg('')
    if (!resumeFile) {
      setErr('Please upload your resume file while applying.')
      return
    }
    try {
      const uploaded = await api.uploadResume(resumeFile)
      await api.createApplication(Number(id), uploaded.id)
      setMsg('Application submitted.')
      setResumeFile(null)
    } catch (e) {
      setErr(e.response?.data?.detail || 'Could not apply.')
    }
  }

  if (err && !job) {
    return (
      <div className={`page ${pageClass}`}>
        <p className="error">{err}</p>
        <Link to={isSeeker ? '/seeker/jobs' : '/recruiter/jobs'}>Back</Link>
      </div>
    )
  }
  if (!job) return <p className="muted">Loading…</p>

  const requiredCount = (job.job_skills || []).filter((s) => s.required).length
  const preferredCount = (job.job_skills || []).length - requiredCount

  return (
    <div className={`page ${pageClass}`}>
      <PageHero
        variant={isSeeker ? 'seeker' : 'recruiter'}
        title={job.title}
        subtitle={`${job.location || 'Remote / unspecified'} · Posted ${formatDate(job.created_at)} · ${job.recruiter_email}`}
      >
        <Link to={isSeeker ? '/seeker/jobs' : '/recruiter/jobs'} className="btn ghost">
          ← Back to list
        </Link>
        {!isSeeker && job.recruiter === user?.id && (
          <Link className="btn secondary" to={`/recruiter/jobs/${id}/edit`}>
            Edit job
          </Link>
        )}
      </PageHero>

      <div className="detail-meta-grid">
        <article className="card meta-card">
          <p className="meta-label">Status</p>
          <span className={`pill pill-${statusTone(job.status)}`}>{job.status}</span>
        </article>
        <article className="card meta-card">
          <p className="meta-label">Required skills</p>
          <p className="meta-value">{requiredCount}</p>
        </article>
        <article className="card meta-card">
          <p className="meta-label">Preferred skills</p>
          <p className="meta-value">{preferredCount}</p>
        </article>
      </div>

      <section className="card prose">
        <h2>Role description</h2>
        <p style={{ whiteSpace: 'pre-wrap' }}>{job.description}</p>
      </section>

      <section className="card">
        <h2>Skills profile</h2>
        <ul className="tags">
          {(job.job_skills || []).map((js) => (
            <li key={js.id} className={js.required ? 'tag required' : 'tag'}>
              {js.skill?.name} {js.required ? '(required)' : '(preferred)'}
            </li>
          ))}
        </ul>
      </section>

      {isSeeker && (
        <section className="card apply-card">
          <h2>Apply for this role</h2>
          <p className="muted small">Upload a PDF or TXT resume. Text is extracted to improve matching.</p>
          {msg && <p className="success">{msg}</p>}
          {err && <p className="error">{err}</p>}
          <label className="search-wrap">
            Resume file
            <input
              className="search-input"
              type="file"
              accept=".pdf,.txt"
              onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
            />
          </label>
          <button type="button" className="btn primary" onClick={apply}>
            Submit application
          </button>
        </section>
      )}

      {!isSeeker && candidates && (
        <section className="card mt">
          <h2>Matched candidates</h2>
          <p className="muted small">Ranked by skill overlap with this job.</p>
          {candidates.length === 0 && <p className="muted">No scored matches yet.</p>}
          <ul className="stack candidate-stack">
            {candidates.map((row, i) => (
              <li key={i} className="card candidate-card">
                <div className="candidate-head">
                  <strong>{row.user?.email}</strong>
                  <span className="pill score">{Math.round(row.match_score * 100)}% match</span>
                </div>
                <div className="match-bar-wrap">
                  <div className="match-bar" style={{ width: `${Math.round(row.match_score * 100)}%` }} />
                </div>
                <div className="tags mt">
                  {row.skills?.map((s) => (
                    <span key={s.id} className="tag">
                      {s.name}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
