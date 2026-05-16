import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import * as api from '../api'

const emptySkillRow = () => ({ skill_id: '', required: true })

export default function JobForm() {
  const { jobId } = useParams()
  const isEdit = Boolean(jobId)
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [status, setStatus] = useState('draft')
  const [skillRows, setSkillRows] = useState([emptySkillRow()])
  const [catalog, setCatalog] = useState([])
  const [err, setErr] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const s = await api.fetchSkills()
        setCatalog(s)
      } catch {
        setErr('Could not load skills.')
      }
    })()
  }, [])

  useEffect(() => {
    if (!isEdit) return
    ;(async () => {
      try {
        const j = await api.fetchJob(jobId)
        setTitle(j.title)
        setDescription(j.description)
        setLocation(j.location || '')
        setStatus(j.status)
        const rows =
          (j.job_skills || []).map((js) => ({
            skill_id: String(js.skill?.id || js.skill_id || ''),
            required: js.required,
          })) || [emptySkillRow()]
        setSkillRows(rows.length ? rows : [emptySkillRow()])
      } catch {
        setErr('Could not load job.')
      }
    })()
  }, [jobId, isEdit])

  function addRow() {
    setSkillRows((r) => [...r, emptySkillRow()])
  }

  function setRow(i, patch) {
    setSkillRows((rows) => rows.map((row, j) => (j === i ? { ...row, ...patch } : row)))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setErr('')
    const skills = skillRows
      .filter((r) => r.skill_id)
      .map((r) => ({ skill_id: Number(r.skill_id), required: Boolean(r.required) }))
    const body = { title, description, location, status, skills }
    try {
      if (isEdit) {
        await api.patchJob(jobId, body)
        navigate(`/recruiter/jobs/${jobId}`)
      } else {
        await api.createJob(body)
        navigate('/recruiter/jobs')
      }
    } catch (ex) {
      setErr(JSON.stringify(ex.response?.data || 'Save failed'))
    }
  }

  return (
    <div className="page">
      <p>
        <Link to="/recruiter/jobs">← Back</Link>
      </p>
      <h1>{isEdit ? 'Edit job' : 'Post a job'}</h1>
      {err && <p className="error">{err}</p>}
      <form className="card form-card" onSubmit={onSubmit}>
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label>
          Location
          <input value={location} onChange={(e) => setLocation(e.target.value)} />
        </label>
        <label>
          Description
          <textarea rows={8} value={description} onChange={(e) => setDescription(e.target.value)} required />
        </label>
        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="closed">Closed</option>
          </select>
        </label>
        <fieldset>
          <legend>Skills</legend>
          {skillRows.map((row, i) => (
            <div key={i} className="row-inline">
              <select value={row.skill_id} onChange={(e) => setRow(i, { skill_id: e.target.value })}>
                <option value="">— skill —</option>
                {catalog.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <label className="check">
                <input
                  type="checkbox"
                  checked={row.required}
                  onChange={(e) => setRow(i, { required: e.target.checked })}
                />
                Required
              </label>
            </div>
          ))}
          <button type="button" className="btn ghost" onClick={addRow}>
            + Add skill
          </button>
        </fieldset>
        <button type="submit" className="btn primary">
          Save
        </button>
      </form>
    </div>
  )
}
