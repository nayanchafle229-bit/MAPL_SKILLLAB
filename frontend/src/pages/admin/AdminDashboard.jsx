import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import Layout from '../../components/Layout'
import { StatCard, PageLoader } from '../../components/UI'

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null)
  const [results, setResults] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/results'),
      api.get('/admin/quiz'),
    ]).then(([sRes, rRes, qRes]) => {
      setStats(sRes.data.stats)
      setResults((rRes.data.results || []).slice(0, 6))
      setQuizzes((qRes.data.quizzes || []).slice(0, 4))
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <Layout title="Admin Dashboard"><PageLoader /></Layout>

  const quickLinks = [
    { to:'/admin/quizzes/create', icon:'🧠', label:'Create Quiz',      desc:'New difficulty-based quiz', color:'bg-primary-600' },
    { to:'/admin/questions',      icon:'❓', label:'Add Questions',     desc:'Manage question bank',      color:'bg-purple-600' },
    { to:'/admin/courses',        icon:'📚', label:'Add Course',        desc:'Upload course + video',     color:'bg-emerald-600' },
    { to:'/admin/users',          icon:'👥', label:'View Users',        desc:'All registered students',   color:'bg-orange-500' },
  ]

  return (
    <Layout title="Admin Dashboard">
      {/* Hero */}
      <div className="bg-gradient-to-r from-surface-card via-primary-900 to-primary-900 rounded-3xl p-6 mb-6 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-red-500/20 border border-red-400/30 rounded-2xl flex items-center justify-center text-2xl">🔴</div>
          <div>
            <h2 className="text-xl font-black">Administrator Panel</h2>
            <p className="text-slate-400 text-sm">Smart Quiz & Evaluation System — Full Control</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[['👥', stats?.totalUsers||0,'Students'],['❓',stats?.totalQuestions||0,'Questions'],['🧠',stats?.totalQuizzes||stats?.totalCourses||0,'Quizzes'],['🎯',stats?.totalAttempts||0,'Attempts']].map(([ic,v,l])=>(
            <div key={l} className="bg-white/10 border border-white/20 rounded-2xl p-4 text-center backdrop-blur-sm">
              <span className="text-2xl">{ic}</span>
              <p className="text-2xl font-black mt-1">{v}</p>
              <p className="text-slate-400 text-xs font-medium">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard icon="👥" label="Total Students"   value={stats?.totalUsers     || 0} color="blue"   />
        <StatCard icon="❓" label="Questions"         value={stats?.totalQuestions || 0} color="purple" />
        <StatCard icon="📚" label="Courses"           value={stats?.totalCourses   || 0} color="green"  />
        <StatCard icon="🎯" label="Quiz Attempts"     value={stats?.totalAttempts  || 0} color="orange" />
        <StatCard icon="📈" label="Avg Score"         value={`${stats?.avgScore || 0}%`} color="indigo" />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {quickLinks.map(l => (
          <Link key={l.to} to={l.to}
            className="bg-surface-card rounded-2xl border border-white/10 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer">
            <div className={`w-11 h-11 ${l.color} rounded-xl flex items-center justify-center text-xl mb-3 shadow-sm group-hover:scale-110 transition-transform`}>
              {l.icon}
            </div>
            <h3 className="font-black text-white text-sm group-hover:text-primary-400 transition-colors">{l.label}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{l.desc}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent quizzes */}
        <div className="bg-surface-card rounded-2xl border border-white/10 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <h3 className="font-black text-white text-sm">🧠 Recent Quizzes</h3>
            <Link to="/admin/quizzes" className="text-xs text-primary-400 hover:underline font-bold">View all →</Link>
          </div>
          {quizzes.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-slate-500 text-sm">No quizzes yet.</p>
              <Link to="/admin/quizzes/create" className="mt-3 inline-block text-xs bg-primary-600 text-white px-4 py-2 rounded-xl font-bold">+ Create Quiz</Link>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {quizzes.map(q => (
                <div key={q._id} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/5 transition-colors">
                  <div className="min-w-0">
                    <p className="font-bold text-white text-sm truncate">{q.title}</p>
                    <p className="text-xs text-slate-500">{q.totalQuestions}Q · {q.totalMarks}M · {q.attemptCount||0} attempts</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${q.isActive?'bg-accent-500/15 text-accent-400':'bg-white/5 text-slate-400'}`}>
                      {q.isActive?'Active':'Off'}
                    </span>
                    <Link to={`/admin/quizzes/${q._id}/leaderboard`} className="text-xs bg-primary-500/10 text-primary-400 px-2.5 py-1 rounded-lg font-semibold hover:bg-primary-500/20">LB</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent results */}
        <div className="bg-surface-card rounded-2xl border border-white/10 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <h3 className="font-black text-white text-sm">🏆 Recent Results</h3>
            <Link to="/admin/results" className="text-xs text-primary-400 hover:underline font-bold">View all →</Link>
          </div>
          {results.length === 0 ? (
            <div className="text-center py-10"><p className="text-slate-500 text-sm">No results yet.</p></div>
          ) : (
            <div className="divide-y divide-white/5">
              {results.map(r => {
                const pct = r.percentage
                return (
                  <div key={r._id} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-black text-xs flex-shrink-0">
                        {(r.userId?.profile?.name||r.userId?.email||'U')[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white text-sm truncate">{r.userId?.profile?.name||'Student'}</p>
                        <p className="text-xs text-slate-500 truncate">{r.userId?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <span className="font-black text-sm text-white">{r.score}/{r.totalMarks}</span>
                      <span className={`text-xs font-black px-2.5 py-1 rounded-full ${r.passStatus==='PASS'?'bg-accent-500/15 text-accent-400':'bg-red-500/15 text-red-400'}`}>
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
