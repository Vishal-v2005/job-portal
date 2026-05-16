export function descPreview(text, max = 140) {
  const t = (text || '').replace(/\s+/g, ' ').trim()
  if (!t) return 'No description provided.'
  return t.length <= max ? t : `${t.slice(0, max)}…`
}

export function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function jobSkillTags(job, max = 5) {
  const rows = job?.job_skills || []
  const shown = rows.slice(0, max)
  const rest = rows.length - shown.length
  return { shown, rest }
}

export function statusTone(status) {
  if (status === 'published') return 'success'
  if (status === 'draft') return 'warn'
  if (status === 'closed') return 'muted'
  return 'default'
}

export function applicationTone(status) {
  if (status === 'offer') return 'success'
  if (status === 'interview' || status === 'reviewing') return 'info'
  if (status === 'rejected') return 'danger'
  return 'default'
}
