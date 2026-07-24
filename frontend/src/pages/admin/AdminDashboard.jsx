import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import Layout from '../../components/Layout'
import { PageLoader } from '../../components/UI'
import {
  IconUsers, IconBook, IconHelp, IconBrain, IconTrending, IconShield,
  IconChevronRight,
} from '../../components/Icons'
import '../../styles/AdminDashboard.css'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})
  const [users, setUsers] = useState([])
  const [courses, setCourses] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [results, setResults] = useState([])

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats').catch(() => ({ data: {} })),
      api.get('/admin/users').catch(() => ({ data: { users: [] } })),
      api.get('/course').catch(() => ({ data: { courses: [] } })),
      api.get('/admin/quiz').catch(() => ({ data: { quizzes: [] } })),
      api.get('/admin/results').catch(() => ({ data: { results: [] } })),
    ])
      .then(([sRes, uRes, cRes, qRes, rRes]) => {
        setStats(sRes.data.stats || {})
        setUsers(uRes.data.users || [])
        setCourses(cRes.data.courses || [])
        setQuizzes(qRes.data.quizzes || [])
        setResults(rRes.data.results || [])
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <Layout title="Admin Dashboard"><PageLoader /></Layout>
  }

  return (
    <Layout title="Admin Dashboard">
      <div className="admin-dashboard">

        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="admin-hero">
          <div className="admin-hero-left">
            <span className="admin-badge">MAPL SkillLab Admin Panel</span>
            <h1>Welcome Back,<br />Administrator</h1>
            <p>Manage users, courses, quizzes and platform performance from one centralized dashboard.</p>

            <div className="admin-actions">
              {/* Both routes go to real, existing pages — the originals pointed at
                  /admin/course/new and /admin/quiz/new, neither of which exist. */}
              <Link to="/admin/courses" className="hero-btn primary">+ Add Course</Link>
              <Link to="/admin/quizzes/create" className="hero-btn secondary">+ Create Quiz</Link>
            </div>
          </div>

          <div className="admin-hero-right">
            <div className="hero-summary-card">
              <h3>Platform Summary</h3>
              <div className="summary-row"><span>Total Users</span><strong>{stats.totalUsers}</strong></div>
              <div className="summary-row"><span>Total Courses</span><strong>{stats.totalCourses}</strong></div>
              <div className="summary-row"><span>Total Quizzes</span><strong>{stats.totalQuizzes}</strong></div>
              <div className="summary-row"><span>Total Attempts</span><strong>{stats.totalAttempts}</strong></div>
            </div>
          </div>
        </section>

        {/* ── Stats ────────────────────────────────────────── */}
        <section className="admin-stats">
          <div className="admin-stat-card blue">
            <div className="stat-icon"><IconUsers className="w-6 h-6" /></div>
            <div><h2>{users.length}</h2><p>Total Users</p></div>
          </div>
          <div className="admin-stat-card purple">
            <div className="stat-icon"><IconBook className="w-6 h-6" /></div>
            <div><h2>{courses.length}</h2><p>Total Courses</p></div>
          </div>
          <div className="admin-stat-card green">
            <div className="stat-icon"><IconHelp className="w-6 h-6" /></div>
            <div><h2>{quizzes.length}</h2><p>Total Quizzes</p></div>
          </div>
          <div className="admin-stat-card orange">
            <div className="stat-icon"><IconTrending className="w-6 h-6" /></div>
            <div><h2>{results.length}</h2><p>Total Results</p></div>
          </div>
        </section>

        {/* ── Quick actions ────────────────────────────────── */}
        <section className="admin-actions-section">
          <div className="section-title">
            <div>
              <h2>Quick Actions</h2>
              <p>Frequently used administrator tools.</p>
            </div>
          </div>

          <div className="action-grid">
            <Link to="/admin/courses" className="action-card">
              <div className="action-icon blue"><IconBook className="w-6 h-6" /></div>
              <h3>Add Course</h3>
              <p>Create a new learning module.</p>
              <span className="flex items-center gap-1">Open <IconChevronRight className="w-3.5 h-3.5" /></span>
            </Link>

            <Link to="/admin/quizzes/create" className="action-card">
              <div className="action-icon purple"><IconHelp className="w-6 h-6" /></div>
              <h3>Create Quiz</h3>
              <p>Create assessments for learners.</p>
              <span className="flex items-center gap-1">Open <IconChevronRight className="w-3.5 h-3.5" /></span>
            </Link>

            <Link to="/admin/users" className="action-card">
              <div className="action-icon green"><IconUsers className="w-6 h-6" /></div>
              <h3>Manage Users</h3>
              <p>View and manage registered users.</p>
              <span className="flex items-center gap-1">Open <IconChevronRight className="w-3.5 h-3.5" /></span>
            </Link>

            <Link to="/admin/courses" className="action-card">
              <div className="action-icon orange"><IconBook className="w-6 h-6" /></div>
              <h3>Manage Courses</h3>
              <p>Edit existing learning modules.</p>
              <span className="flex items-center gap-1">Open <IconChevronRight className="w-3.5 h-3.5" /></span>
            </Link>

            <Link to="/admin/quizzes" className="action-card">
              <div className="action-icon red"><IconBrain className="w-6 h-6" /></div>
              <h3>Manage Quizzes</h3>
              <p>Edit or delete quizzes.</p>
              <span className="flex items-center gap-1">Open <IconChevronRight className="w-3.5 h-3.5" /></span>
            </Link>

            <Link to="/admin/results" className="action-card">
              <div className="action-icon cyan"><IconTrending className="w-6 h-6" /></div>
              <h3>Reports</h3>
              <p>View quiz reports and analytics.</p>
              <span className="flex items-center gap-1">Open <IconChevronRight className="w-3.5 h-3.5" /></span>
            </Link>
          </div>
        </section>

        {/* ── Platform overview ────────────────────────────── */}
        <section className="platform-overview">
          <div className="overview-card">
            <div className="overview-header">
              <h2>Recent Users</h2>
              <Link to="/admin/users">View All <IconChevronRight className="w-3.5 h-3.5" /></Link>
            </div>
            <div className="overview-list">
              {users.slice(0, 5).map(u => (
                <div key={u._id} className="overview-item">
                  <div className="overview-avatar">{u.name?.charAt(0).toUpperCase()}</div>
                  <div className="overview-content">
                    <h4>{u.name}</h4>
                    <p>{u.email}</p>
                  </div>
                </div>
              ))}
              {users.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No users yet.</p>}
            </div>
          </div>

          <div className="overview-card">
            <div className="overview-header">
              <h2>Latest Courses</h2>
              <Link to="/admin/courses">View All <IconChevronRight className="w-3.5 h-3.5" /></Link>
            </div>
            <div className="overview-list">
              {courses.slice(0, 5).map(c => (
                <div key={c._id} className="overview-item">
                  <div className="course-icon"><IconBook className="w-5 h-5" /></div>
                  <div className="overview-content">
                    <h4>{c.title}</h4>
                    <p>{c.category}</p>
                  </div>
                </div>
              ))}
              {courses.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No courses yet.</p>}
            </div>
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────────── */}
        <footer className="admin-footer">
          <div>© 2026 MAPL SkillLab</div>
          <div className="flex items-center gap-1.5"><IconShield className="w-3.5 h-3.5" /> Enterprise LMS</div>
        </footer>

      </div>
    </Layout>
  )
}
