import { useState } from 'react'
import * as api from '../api'

export default function ResumeUpload() {
  const [file, setFile] = useState(null)
  const [resume, setResume] = useState(null)
  const [suggested, setSuggested] = useState([])
  const [err, setErr] = useState('')

  async function onUpload(e) {
    e.preventDefault()
    if (!file) return
    setErr('')
    try {
      const data = await api.uploadResume(file)
      setResume(data)
      const sug = await api.fetchResumeSuggestions(data.id)
      setSuggested(sug)
    } catch (ex) {
      setErr(ex.response?.data?.detail || 'Upload failed.')
    }
  }

  return (
    <div className="page">
      <h1>Resume upload</h1>
      <p className="muted">PDF or plain text. We extract text and suggest skills from a built-in dictionary.</p>
      {err && <p className="error">{err}</p>}
      <form className="card form-card" onSubmit={onUpload}>
        <label>
          File
          <input type="file" accept=".pdf,.txt" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </label>
        <button type="submit" className="btn primary" disabled={!file}>
          Upload &amp; extract
        </button>
      </form>
      {resume && (
        <section className="mt card">
          <h2>Last upload</h2>
          <p className="muted small">Uploaded {new Date(resume.uploaded_at).toLocaleString()}</p>
          <p>
            <span className="pill score">Resume score: {resume.resume_score ?? 0}%</span>
          </p>
          <details>
            <summary>Extracted text preview</summary>
            <pre className="pre">{resume.extracted_text?.slice(0, 2000) || '—'}</pre>
          </details>
          <h3>Suggested skills</h3>
          {suggested.length === 0 ? (
            <p className="muted">No dictionary matches in this file.</p>
          ) : (
            <ul className="tags">
              {suggested.map((s) => (
                <li key={s.id} className="tag">
                  {s.name}
                </li>
              ))}
            </ul>
          )}
          <p className="muted small">Confirm skills on the Skills page before applying.</p>
        </section>
      )}
    </div>
  )
}
