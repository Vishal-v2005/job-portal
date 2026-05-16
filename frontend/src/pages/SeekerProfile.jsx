import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../api'
import PageHero from '../components/PageHero'
import StatsGrid from '../components/StatsGrid'

export default function SeekerProfile() {
  const [profile, setProfile] = useState({ headline: '', skills: [] })
  const [allSkills, setAllSkills] = useState([])
  const [selected, setSelected] = useState(new Set())
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const [p, s] = await Promise.all([api.fetchSeekerProfile(), api.fetchSkills()])
        setProfile(p)
        setAllSkills(s)
        setSelected(new Set((p.skills || []).map((id) => id)))
      } catch {
        setErr('Could not load profile.')
      }
    })()
  }, [])

  function toggleSkill(id) {
    setSelected((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  async function save(e) {
    e.preventDefault()
    setErr('')
    setMsg('')
    try {
      const data = await api.patchSeekerProfile({
        headline: profile.headline,
        skills: [...selected],
      })
      setProfile(data)
      setMsg('Profile updated successfully.')
    } catch {
      setErr('Save failed.')
    }
  }

  return (
    <div className="page page-seeker">
      <PageHero
        variant="seeker"
        title="Your profile & skills"
        subtitle="Your headline and skills power recommendations and recruiter matching."
      />

      <StatsGrid
        items={[
          { label: 'Skills selected', value: selected.size, hint: `Out of ${allSkills.length} available`, tone: 'success' },
          { label: 'Profile headline', value: profile.headline ? 'Set' : 'Missing', hint: 'Add a short professional title', tone: 'default' },
        ]}
      />

      {err && <p className="error">{err}</p>}
      {msg && <p className="success">{msg}</p>}

      <div className="grid-2 profile-grid">
        <form className="card form-card" onSubmit={save}>
          <h2>Profile details</h2>
          <label>
            Headline
            <input
              value={profile.headline || ''}
              onChange={(e) => setProfile((p) => ({ ...p, headline: e.target.value }))}
              placeholder="e.g. Full-stack developer · Open to remote"
            />
          </label>
          <fieldset>
            <legend>Skills</legend>
            <div className="skill-grid">
              {allSkills.map((s) => (
                <label key={s.id} className="check">
                  <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggleSkill(s.id)} />
                  {s.name}
                </label>
              ))}
            </div>
          </fieldset>
          <button type="submit" className="btn primary">
            Save profile
          </button>
        </form>

        <aside className="card tip-card">
          <h2>Profile tips</h2>
          <ul className="tip-list muted">
            <li>Select skills that appear on your resume and target roles.</li>
            <li>Use a clear headline with role + specialization.</li>
            <li>Visit <strong>For you</strong> after saving to refresh match scores.</li>
          </ul>
          <Link to="/seeker/recommended" className="btn secondary">
            View recommendations
          </Link>
        </aside>
      </div>
    </div>
  )
}
