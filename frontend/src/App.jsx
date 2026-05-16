import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, ROLES } from './auth/AuthContext'
import Layout, { adminNav, recruiterNav, seekerNav } from './components/Layout'
import RequireAuth from './components/RequireAuth'
import RequireRole from './components/RequireRole'
import AdminAnalytics from './pages/AdminAnalytics'
import Applications from './pages/Applications'
import HomeRedirect from './pages/HomeRedirect'
import JobDetail from './pages/JobDetail'
import JobForm from './pages/JobForm'
import Login from './pages/Login'
import RecruiterJobs from './pages/RecruiterJobs'
import Register from './pages/Register'
import SeekerJobs from './pages/SeekerJobs'
import SeekerProfile from './pages/SeekerProfile'
import SeekerRecommended from './pages/SeekerRecommended'
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/seeker"
            element={
              <RequireAuth>
                <RequireRole role={ROLES.JOB_SEEKER}>
                  <Layout nav={seekerNav()} />
                </RequireRole>
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="recommended" replace />} />
            <Route path="recommended" element={<SeekerRecommended />} />
            <Route path="jobs" element={<SeekerJobs />} />
            <Route path="jobs/:jobId" element={<JobDetail mode="seeker" />} />
            <Route path="applications" element={<Applications />} />
            <Route path="profile" element={<SeekerProfile />} />
          </Route>

          <Route
            path="/recruiter"
            element={
              <RequireAuth>
                <RequireRole role={ROLES.RECRUITER}>
                  <Layout nav={recruiterNav()} />
                </RequireRole>
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="jobs" replace />} />
            <Route path="jobs" element={<RecruiterJobs />} />
            <Route path="jobs/new" element={<JobForm />} />
            <Route path="jobs/:jobId/edit" element={<JobForm />} />
            <Route path="jobs/:jobId" element={<JobDetail mode="recruiter" />} />
            <Route path="applications" element={<Applications />} />
          </Route>

          <Route
            path="/admin"
            element={
              <RequireAuth>
                <RequireRole role={ROLES.ADMIN}>
                  <Layout nav={adminNav()} />
                </RequireRole>
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="analytics" replace />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
