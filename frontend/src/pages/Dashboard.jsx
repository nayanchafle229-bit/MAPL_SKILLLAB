import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import Layout from '../components/Layout'
import { PageLoader } from '../components/UI'
import {
  IconBook, IconCheck, IconTrophy, IconMedal, IconLayers, IconClock,
  IconStar, IconCalendar, IconChevronRight,
} from '../components/Icons'
import '../styles/Dashboard.css'

export default function Dashboard() {
  const { user } = useAuth()
  const [results, setResults] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/quiz/my-results').catch(() => ({ data: { results: [] } })),
      api.get('/quiz').catch(() => ({ data: { quizzes: [] } })),
    ]).then(([rRes, qRes]) => {
      setResults(rRes.data.results || [])
      setQuizzes((qRes.data.quizzes || []).slice(0, 4))
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <Layout title="Dashboard"><PageLoader /></Layout>

  const p = user?.profile || {}
  const total = results.length
  const passed = results.filter(r => r.passStatus === 'PASS').length
  const best = results.length ? Math.max(...results.map(r => r.percentage)) : null
  const bestRank = results.filter(r => r.rank).length
    ? Math.min(...results.filter(r => r.rank).map(r => r.rank))
    : null
  const pending = quizzes.filter(q => !q.attempted).length

  return (
    <Layout title="Dashboard">
      <div className="dashboard-page">

        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="dashboard-hero">
          <div className="hero-left">
            <div className="hero-badge">MAPL SkillLab Dashboard</div>
            <h1>
              Welcome back,<br />
              <span>{p.name?.split(' ')[0] || 'Engineer'}</span>
            </h1>
            <p>
              Continue your Industrial Automation learning journey. Master DCS, PLC, SCADA,
              Instrumentation and Industrial Networking through structured learning paths.
            </p>
            <div className="hero-buttons">
              <Link to="/courses" className="hero-btn-primary">Browse Courses</Link>
              <Link to="/quizzes" className="hero-btn-secondary">Take Quiz</Link>
            </div>
          </div>

          <div className="hero-right">
            <div className="summary-card">
              <h3>Learning Summary</h3>
              <div className="summary-row"><span>Completed Quizzes</span><strong>{total}</strong></div>
              <div className="summary-row"><span>Passed</span><strong>{passed}</strong></div>
              <div className="summary-row"><span>Pending</span><strong>{pending}</strong></div>
              <div className="summary-row"><span>Best Score</span><strong>{best ? `${best.toFixed(1)}%` : '--'}</strong></div>
            </div>
          </div>
        </section>

        {/* ── Stats ────────────────────────────────────────── */}
        <section className="stats-section">
          <div className="stat-card">
            <div className="stat-icon blue"><IconLayers className="w-6 h-6" /></div>
            <div className="stat-content"><h2>{total}</h2><p>Quizzes Attempted</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><IconCheck className="w-6 h-6" /></div>
            <div className="stat-content"><h2>{passed}</h2><p>Passed</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orange"><IconTrophy className="w-6 h-6" /></div>
            <div className="stat-content"><h2>{best ? `${best.toFixed(0)}%` : '--'}</h2><p>Best Score</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon purple"><IconMedal className="w-6 h-6" /></div>
            <div className="stat-content"><h2>{bestRank ? `#${bestRank}` : '--'}</h2><p>Best Rank</p></div>
          </div>
        </section>

        <div className="dashboard-grid">
          {/* ── Available quizzes ───────────────────────────── */}
          <section className="dashboard-section">
            <div className="section-header">
              <div>
                <span className="section-badge">Latest Assessments</span>
                <h2>Available Quizzes</h2>
                <p>Evaluate your knowledge through industry-focused quizzes.</p>
              </div>
              <Link to="/quizzes" className="view-all-btn">View All <IconChevronRight className="w-3.5 h-3.5" /></Link>
            </div>

            <div className="premium-quiz-grid">
              {quizzes.length === 0 ? (
                <div className="empty-premium">
                  <div className="empty-icon"><IconBook className="w-7 h-7" /></div>
                  <h3>No Quizzes Available</h3>
                  <p>New quizzes published by the administrator will appear here.</p>
                </div>
              ) : (
                quizzes.map((quiz) => (
                  <div className="premium-quiz-card" key={quiz._id}>
                    <div className="quiz-top">
                      <div className="quiz-avatar">{quiz.title.charAt(0)}</div>
                      <span className="quiz-level">Assessment</span>
                    </div>
                    <h3>{quiz.title}</h3>
                    <div className="quiz-meta">
                      <span><IconBook className="w-3.5 h-3.5" /> {quiz.totalQuestions} Questions</span>
                      <span><IconClock className="w-3.5 h-3.5" /> {quiz.duration} Min</span>
                      <span><IconStar className="w-3.5 h-3.5" /> {quiz.totalMarks} Marks</span>
                    </div>
                    <div className="quiz-bottom">
                      {quiz.attempted ? (
                        <span className="completed-chip"><IconCheck className="w-3.5 h-3.5" /> Completed</span>
                      ) : (
                        <Link to={`/quiz/${quiz._id}`} className="start-learning-btn">
                          Start Quiz <IconChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* ── Recent results ──────────────────────────────── */}
          <section className="dashboard-section">
            <div className="section-header">
              <div>
                <span className="section-badge">Performance</span>
                <h2>Recent Results</h2>
                <p>Review your latest quiz performances and track your progress.</p>
              </div>
              <Link to="/history" className="view-all-btn">View All <IconChevronRight className="w-3.5 h-3.5" /></Link>
            </div>

            {results.length === 0 ? (
              <div className="empty-premium">
                <div className="empty-icon"><IconLayers className="w-7 h-7" /></div>
                <h3>No Results Available</h3>
                <p>Complete your first quiz to view detailed performance analytics.</p>
                <Link to="/quizzes" className="start-learning-btn">Take Your First Quiz</Link>
              </div>
            ) : (
              <div className="premium-results">
                {results.slice(0, 5).map((result) => (
                  <Link key={result._id} to={`/result/${result._id}`} className="premium-result-card">
                    <div className="result-left">
                      <div className="result-avatar">{result.quizId?.title?.charAt(0) || 'Q'}</div>
                      <div>
                        <h3>{result.quizId?.title || 'Quiz'}</h3>
                        <p><IconCalendar className="w-3.5 h-3.5" /> {new Date(result.createdAt).toLocaleDateString('en-IN')}</p>
                      </div>
                    </div>
                    <div className="result-center">
                      <div className="score-box">{result.score}/{result.totalMarks}</div>
                      <div className="percentage-box">{result.percentage.toFixed(0)}%</div>
                    </div>
                    <div className="result-right">
                      <span className={`status-chip ${result.passStatus === 'PASS' ? 'pass' : 'fail'}`}>{result.passStatus}</span>
                      {result.rank && <div className="rank-chip"><IconTrophy className="w-3.5 h-3.5" /> Rank #{result.rank}</div>}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ── CTA ──────────────────────────────────────────── */}
        <section className="premium-cta">
          <div className="cta-content">
            <div>
              <span className="section-badge" style={{ background: 'rgba(255,255,255,0.18)', color: '#fff' }}>Continue Learning</span>
              <h2>Ready for your next challenge?</h2>
              <p>Continue building your expertise in DCS, PLC, SCADA, Industrial Networking and Instrumentation through MAPL SkillLab.</p>
            </div>
            <div className="cta-buttons">
              <Link to="/courses" className="hero-btn-primary">Browse Courses</Link>
              <Link to="/quizzes" className="hero-btn-secondary">Take Quiz</Link>
            </div>
          </div>
        </section>

      </div>
    </Layout>
  )
}
