import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import * as api from '../api'

const AuthContext = createContext(null)

export const ROLES = {
  JOB_SEEKER: 'job_seeker',
  RECRUITER: 'recruiter',
  ADMIN: 'admin',
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    const t = localStorage.getItem('access')
    if (!t) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const me = await api.fetchMe()
      setUser(me)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = useCallback(async (email, password) => {
    await api.login(email, password)
    const me = await api.fetchMe()
    setUser(me)
    return me
  }, [])

  const register = useCallback(async (payload) => {
    await api.register(payload)
    await api.login(payload.email, payload.password)
    const me = await api.fetchMe()
    setUser(me)
    return me
  }, [])

  const logout = useCallback(() => {
    api.logout()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, reloadUser: loadUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
