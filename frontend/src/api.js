import axios from 'axios'

function resolveApiBase() {
  const fromEnv = (import.meta.env.VITE_API_URL || '').trim()
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  if (import.meta.env.PROD && typeof window !== 'undefined') {
    // Vercel rewrites /api and /media to Render (see vercel.json)
    return window.location.origin
  }
  return 'http://127.0.0.1:8000'
}

export const API_BASE = resolveApiBase()

/** Turn relative /media/... paths into a full URL for resume links. */
export function mediaUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`
}

const client = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { 'Content-Type': 'application/json' },
})

function getAccess() {
  return localStorage.getItem('access')
}

function getRefresh() {
  return localStorage.getItem('refresh')
}

function setTokens(access, refresh) {
  if (access) localStorage.setItem('access', access)
  if (refresh) localStorage.setItem('refresh', refresh)
}

function clearTokens() {
  localStorage.removeItem('access')
  localStorage.removeItem('refresh')
}

client.interceptors.request.use((config) => {
  const t = getAccess()
  if (t) config.headers.Authorization = `Bearer ${t}`
  return config
})

let refreshPromise = null
client.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry && getRefresh()) {
      original._retry = true
      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post(`${API_BASE}/api/auth/token/refresh/`, { refresh: getRefresh() })
            .then((res) => {
              setTokens(res.data.access, null)
              return res.data.access
            })
            .finally(() => {
              refreshPromise = null
            })
        }
        const access = await refreshPromise
        original.headers.Authorization = `Bearer ${access}`
        return client(original)
      } catch {
        clearTokens()
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  },
)

export async function login(email, password) {
  const { data } = await axios.post(`${API_BASE}/api/auth/token/`, { email, password })
  setTokens(data.access, data.refresh)
  return data
}

export function logout() {
  clearTokens()
}

export async function register(payload) {
  const { data } = await axios.post(`${API_BASE}/api/auth/register/`, payload)
  return data
}

export async function fetchMe() {
  const { data } = await client.get('/me/')
  return data
}

export async function patchMe(body) {
  const { data } = await client.patch('/me/', body)
  return data
}

export async function fetchSeekerProfile() {
  const { data } = await client.get('/seeker/profile/')
  return data
}

export async function patchSeekerProfile(body) {
  const { data } = await client.patch('/seeker/profile/', body)
  return data
}

export async function fetchRecruiterProfile() {
  const { data } = await client.get('/recruiter/profile/')
  return data
}

export async function patchRecruiterProfile(body) {
  const { data } = await client.patch('/recruiter/profile/', body)
  return data
}

function unwrapList(data) {
  return Array.isArray(data) ? data : data?.results ?? []
}

export async function fetchSkills() {
  const { data } = await client.get('/skills/')
  return unwrapList(data)
}

export async function fetchJobs() {
  const { data } = await client.get('/jobs/')
  return unwrapList(data)
}

export async function fetchRecommendedJobs() {
  const { data } = await client.get('/jobs/recommended/')
  return unwrapList(data)
}

export async function fetchMyJobs() {
  const { data } = await client.get('/jobs/mine/')
  return unwrapList(data)
}

export async function fetchJob(id) {
  const { data } = await client.get(`/jobs/${id}/`)
  return data
}

export async function createJob(body) {
  const { data } = await client.post('/jobs/', body)
  return data
}

export async function patchJob(id, body) {
  const { data } = await client.patch(`/jobs/${id}/`, body)
  return data
}

export async function fetchApplications() {
  const { data } = await client.get('/applications/')
  return unwrapList(data)
}

export async function createApplication(jobId, resumeId = null) {
  const body = { job: jobId }
  if (resumeId != null) body.resume = resumeId
  const { data } = await client.post('/applications/', body)
  return data
}

export async function patchApplication(id, body) {
  const { data } = await client.patch(`/applications/${id}/`, body)
  return data
}

export async function uploadResume(file) {
  const fd = new FormData()
  fd.append('file', file)
  const { data } = await client.post('/resumes/', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function fetchResumeSuggestions(resumeId) {
  const { data } = await client.get(`/resumes/${resumeId}/suggested_skills/`)
  return data
}

export async function fetchResumes() {
  const { data } = await client.get('/resumes/')
  return unwrapList(data)
}

export async function fetchRecommendedCandidates(jobId) {
  const { data } = await client.get(`/jobs/${jobId}/recommended_candidates/`)
  return data
}

export async function fetchAnalyticsSummary() {
  const { data } = await client.get('/analytics/summary/')
  return data
}

export { client }
