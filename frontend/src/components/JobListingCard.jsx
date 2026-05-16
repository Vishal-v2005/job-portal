import { Link } from 'react-router-dom'
import { descPreview, formatDate, jobSkillTags, statusTone } from '../utils/jobDisplay'

export default function JobListingCard({ job, to, matchScore, showStatus = false, actions }) {
  const { shown, rest } = jobSkillTags(job)
  const tone = statusTone(job.status)

  return (
    <li className="card job-card job-card-rich">
      <div className="job-card-head">
        <div>
          <Link to={to} className="job-title-link">
            {job.title}
          </Link>
          <p className="job-meta muted small">
            <span>{job.location || 'Remote / unspecified'}</span>
            {job.created_at && <span> · Posted {formatDate(job.created_at)}</span>}
          </p>
        </div>
        <div className="job-card-badges">
          {matchScore != null && <span className="pill score">Match {Math.round(matchScore * 100)}%</span>}
          {showStatus && <span className={`pill pill-${tone}`}>{job.status}</span>}
        </div>
      </div>
      <p className="job-desc-preview muted small">{descPreview(job.description)}</p>
      {shown.length > 0 && (
        <ul className="tags job-card-tags">
          {shown.map((js) => (
            <li key={js.id} className={js.required ? 'tag required' : 'tag'}>
              {js.skill?.name}
            </li>
          ))}
          {rest > 0 && <li className="tag">+{rest} more</li>}
        </ul>
      )}
      {matchScore != null && (
        <div className="match-bar-wrap" aria-hidden="true">
          <div className="match-bar" style={{ width: `${Math.round(matchScore * 100)}%` }} />
        </div>
      )}
      {actions && <div className="job-card-actions">{actions}</div>}
    </li>
  )
}

