import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../api'
import { useAuth } from '../auth/AuthContext'
import { ROLES } from '../auth/AuthContext'
import PageHero from '../components/PageHero'
import StatsGrid from '../components/StatsGrid'
import { applicationTone, formatDate } from '../utils/jobDisplay'

const STATUSES = ['submitted', 'reviewing', 'interview', 'offer', 'rejected']

export default function Applications() {
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [err, setErr] = useState('')

  async function load() {
    try {
      const data = await api.fetchApplications()
      setRows(data)
    } catch {
      setErr('Could not load applications.')
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function updateStatus(id, status) {
    try {
      await api.patchApplication(id, { status })
      await load()
    } catch {
      setErr('Update failed.')
    }
  }

  const recruiter = user?.role === ROLES.RECRUITER
  const variant = recruiter ? 'recruiter' : 'seeker'
  const pageClass = recruiter ? 'page-recruiter' : 'page-seeker'

  const summary = useMemo(() => {
    const active = rows.filter((r) => !['rejected', 'offer'].includes(r.status)).length
    const interview = rows.filter((r) => r.status === 'interview').length
    const offer = rows.filter((r) => r.status === 'offer').length
    return { active, interview, offer }
  }, [rows])

  return (
    <div className={`page ${pageClass}`}>
      <PageHero
        variant={variant}
        title={recruiter ? 'Applications pipeline' : 'My applications'}
        subtitle={
          recruiter
            ? 'Review candidates, resume scores, and move applicants through hiring stages.'
            : 'Track where you applied and current status for each role.'
        }
      >
        {recruiter ? (
          <Link to="/recruiter/jobs" className="btn secondary">
            Back to jobs
          </Link>
        ) : (
          <Link to="/seeker/jobs" className="btn primary">
            Find more jobs
          </Link>
        )}
      </PageHero>

      <StatsGrid
        items={[
          { label: 'Total', value: rows.length, hint: 'All records', tone: 'default' },
          { label: 'In progress', value: summary.active, hint: 'Not rejected or offered', tone: 'info' },
          { label: 'Interviews', value: summary.interview, hint: recruiter ? 'Candidates in interview' : 'Your interview stage', tone: 'warn' },
          { label: 'Offers', value: summary.offer, hint: 'Successful outcomes', tone: 'success' },
        ]}
      />

      {err && <p className="error">{err}</p>}

      <section className="card table-card">
        <table className="table">
          <thead>
            <tr>
              <th>Job</th>
              {recruiter && <th>Candidate</th>}
              {recruiter && <th>Resume</th>}
              <th>Status</th>
              <th>Applied</th>
              {recruiter && <th>Update</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id}>
                <td>
                  <strong>{a.job_detail?.title || a.job}</strong>
                  {a.job_detail?.location && <div className="muted small">{a.job_detail.location}</div>}
                </td>
                {recruiter && <td>{a.seeker_email || a.seeker}</td>}
                {recruiter && (
                  <td>
                    {a.application_resume ? (
                      <div>
                        <a href={a.application_resume.file} target="_blank" rel="noreferrer">
                          View resume
                        </a>
                        <div className="muted small">
                          Score {a.application_resume.resume_score ?? 0}%
                          {a.resume_match_score != null ? ` · Match ${Math.round(a.resume_match_score * 100)}%` : ''}
                        </div>
                      </div>
                    ) : (
                      <span className="muted small">No resume</span>
                    )}
                  </td>
                )}
                <td>
                  <span className={`pill pill-${applicationTone(a.status)}`}>{a.status}</span>
                </td>
                <td className="muted small">{formatDate(a.applied_at)}</td>
                {recruiter && (
                  <td>
                    <select
                      className="select-inline"
                      value={a.status}
                      onChange={(e) => updateStatus(a.id, e.target.value)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {rows.length === 0 && !err && <p className="muted">Nothing here yet.</p>}
    </div>
  )
}
