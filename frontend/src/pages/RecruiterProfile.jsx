import { useEffect, useState } from 'react'
import * as api from '../api'

export default function RecruiterProfile() {
  const [company_name, setCompany] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const p = await api.fetchRecruiterProfile()
        setCompany(p.company_name || '')
      } catch {
        setErr('Could not load profile.')
      }
    })()
  }, [])

  async function save(e) {
    e.preventDefault()
    setErr('')
    setMsg('')
    try {
      await api.patchRecruiterProfile({ company_name })
      setMsg('Saved.')
    } catch {
      setErr('Save failed.')
    }
  }

  return (
    <div className="page">
      <h1>Company profile</h1>
      {err && <p className="error">{err}</p>}
      {msg && <p className="success">{msg}</p>}
      <form className="card form-card" onSubmit={save}>
        <label>
          Company name
          <input value={company_name} onChange={(e) => setCompany(e.target.value)} />
        </label>
        <button type="submit" className="btn primary">
          Save
        </button>
      </form>
    </div>
  )
}
