import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Auth pages
import Login          from './pages/Login'
import Register       from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword  from './pages/ResetPassword'
import Profile        from './pages/Profile'

// Student pages
import Dashboard        from './pages/Dashboard'
import Curriculum       from './pages/student/Curriculum'
import ModuleDetail     from './pages/student/ModuleDetail'
import CaseStudy        from './pages/student/CaseStudy'
import Courses          from './pages/Courses'
import CourseWatch      from './pages/CourseWatch'
import History          from './pages/History'
import QuizList         from './pages/student/QuizList'
import QuizAttempt      from './pages/student/QuizAttempt'
import QuizResult       from './pages/student/QuizResult'
import Leaderboard      from './pages/student/Leaderboard'
import StudentPortfolio from './pages/student/StudentPortfolio'
import ProgressTracking      from './pages/ProgressTracking'
import StudentProgressDetail from './pages/StudentProgressDetail'

// Admin pages
import AdminDashboard   from './pages/admin/AdminDashboard'
import AdminCourses     from './pages/admin/AdminCourses'
import AdminQuestions   from './pages/admin/AdminQuestions'
import AdminUsers       from './pages/admin/AdminUsers'
import AdminResults     from './pages/admin/AdminResults'
import AdminQuizzes     from './pages/admin/AdminQuizzes'
import AdminQuizCreate  from './pages/admin/AdminQuizCreate'
import AdminLeaderboard from './pages/admin/AdminLeaderboard'
import AdminCaseReview  from './pages/admin/AdminCaseReview'

// ── Route Guards ────────────────────────────────────────
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()
  if (loading) return <Splash />
  if (!user)   return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />
  // Force profile completion for regular users
  if (user.role !== 'admin' && !user.profileComplete && window.location.pathname !== '/profile')
    return <Navigate to="/profile" replace />
  return children
}

// Allows admins, and any regular user the admin has explicitly granted
// canViewProgress to. Everyone else is bounced back to their home page.
function ProgressRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Splash />
  if (!user)   return <Navigate to="/login" replace />
  const allowed = user.role === 'admin' || user.canViewProgress === true
  if (!allowed) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Splash />
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
  return children
}

import { Loader2 } from 'lucide-react'

function Splash() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1115]">
      <div className="text-center flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-sm font-medium text-slate-400 tracking-wide">Loading Smart Quiz...</p>
      </div>
    </div>
  )
}

// ── App ─────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"         element={<Navigate to="/login" replace />} />
          <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/forgot-password"       element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />

          {/* Student — protected */}
          <Route path="/profile"           element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/dashboard"         element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/curriculum"        element={<ProtectedRoute><Curriculum /></ProtectedRoute>} />
          <Route path="/curriculum/:moduleKey" element={<ProtectedRoute><ModuleDetail /></ProtectedRoute>} />
          <Route path="/quiz/:id/case-study"   element={<ProtectedRoute><CaseStudy /></ProtectedRoute>} />
          <Route path="/courses"           element={<ProtectedRoute><Courses /></ProtectedRoute>} />
          <Route path="/courses/:id"       element={<ProtectedRoute><CourseWatch /></ProtectedRoute>} />
          <Route path="/quizzes"           element={<ProtectedRoute><QuizList /></ProtectedRoute>} />
          <Route path="/quiz/:id"          element={<ProtectedRoute><QuizAttempt /></ProtectedRoute>} />
          <Route path="/result/:id"        element={<ProtectedRoute><QuizResult /></ProtectedRoute>} />
          <Route path="/leaderboard/:id"   element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/portfolio"         element={<ProtectedRoute><StudentPortfolio /></ProtectedRoute>} />
          <Route path="/history"           element={<ProtectedRoute><History /></ProtectedRoute>} />

          {/* Progress tracking — admin, or any user granted access by admin */}
          <Route path="/progress"          element={<ProgressRoute><ProgressTracking /></ProgressRoute>} />
          <Route path="/progress/:id"      element={<ProgressRoute><StudentProgressDetail /></ProgressRoute>} />

          {/* Admin — protected + adminOnly */}
          <Route path="/admin"                         element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/courses"                 element={<ProtectedRoute adminOnly><AdminCourses /></ProtectedRoute>} />
          <Route path="/admin/questions"               element={<ProtectedRoute adminOnly><AdminQuestions /></ProtectedRoute>} />
          <Route path="/admin/users"                   element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/results"                 element={<ProtectedRoute adminOnly><AdminResults /></ProtectedRoute>} />
          <Route path="/admin/quizzes"                 element={<ProtectedRoute adminOnly><AdminQuizzes /></ProtectedRoute>} />
          <Route path="/admin/quizzes/create"          element={<ProtectedRoute adminOnly><AdminQuizCreate /></ProtectedRoute>} />
          <Route path="/admin/quizzes/:id/leaderboard" element={<ProtectedRoute adminOnly><AdminLeaderboard /></ProtectedRoute>} />
          <Route path="/admin/case-review"             element={<ProtectedRoute adminOnly><AdminCaseReview /></ProtectedRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
