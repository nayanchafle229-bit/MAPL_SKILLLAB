import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Medal, Target, CheckCircle2, TrendingUp, Trophy, BookOpen, Award, Inbox } from 'lucide-react'
import api from '../api/axios'
import Layout from '../components/Layout'
import { PageLoader, ScoreRing, PassBadge, StatCard, EmptyState, Alert } from '../components/UI'

export default function StudentProgressDetail() {
  const { id } = useParams()
  const [student, setStudent] = useState(null)
  const [results, setResults] = useState([])
  const [courseProgress, setCourseProgress] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    setLoading(true)
    api.get(`/progress/students/${id}`)
      .then(({ data }) => {
        setStudent(data.student)
        setResults(data.results || [])
        setCourseProgress(data.courseProgress || [])
      })
      .catch(err => setError(err.response?.data?.message || 'Could not load student progress'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Layout title="Student Progress"><PageLoader /></Layout>

  if (error || !student) {
    return (
      <Layout title="Student Progress">
        <Alert type="error" message={error || 'Student not found'} />
        <Link to="/progress" className="inline-block mt-4 text-sm text-primary-400 font-bold hover:underline">← Back to Progress Tracking</Link>
      </Layout>
    )
  }

  const p = student.profile || {}
  const total    = results.length
  const passed   = results.filter(r => r.passStatus === 'PASS').length
  const failed   = total - passed
  const passRate = total ? ((passed / total) * 100).toFixed(0) : 0
  const scores   = results.map(r => r.percentage)
  const best     = scores.length ? Math.max(...scores).toFixed(1) : null
  const avg      = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : null
  const bestRank = results.length ? Math.min(...results.filter(r => r.rank).map(r => r.rank)) : null

  // Skill levels derived from quiz performance per topic
  const topicMap = {}
  results.forEach(r => {
    const topic = r.quizId?.category || 'General'
    if (!topicMap[topic]) topicMap[topic] = { attempts: 0, totalPct: 0 }
    topicMap[topic].attempts++
    topicMap[topic].totalPct += r.percentage
  })
  const skills = Object.entries(topicMap).map(([topic, d]) => ({
    topic, avg: d.totalPct / d.attempts, attempts: d.attempts
  })).sort((a, b) => b.avg - a.avg)

  const trend = results.slice(0, 8).reverse()

  const coursesStarted   = courseProgress.length
  const coursesCompleted = courseProgress.filter(cp => cp.status === 'completed').length

  const getLevel = (pct) => pct >= 85 ? 'Expert' : pct >= 70 ? 'Advanced' : pct >= 55 ? 'Intermediate' : 'Beginner'
  const getLevelColor = (pct) => pct >= 85 ? 'text-accent-400 bg-accent-500/10' : pct >= 70 ? 'text-primary-400 bg-primary-500/10' : pct >= 55 ? 'text-amber-600 bg-amber-500/10' : 'text-slate-400 bg-white/5'

  return (
    <Layout title="Student Progress">
      <Link to="/progress" className="inline-block mb-4 text-sm text-primary-400 font-bold hover:underline">← Back to all students</Link>

      {/* Profile hero */}
      <div className="bg-gradient-to-br from-surface-card to-primary-900 rounded-3xl p-6 mb-6 text-white">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-accent-500 rounded-2xl flex items-center justify-center text-3xl font-black shadow-xl flex-shrink-0">
            {(p.name || student.email || 'U')[0].toUpperCase()}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-2xl font-black mb-0.5">{p.name || 'Student'}</h2>
            <p className="text-blue-300 text-sm mb-1">{student.email}</p>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start text-xs mt-2">
              {p.branch && <span className="bg-white/10 px-3 py-1 rounded-full border border-white/20">{p.branch}</span>}
              {p.year   && <span className="bg-white/10 px-3 py-1 rounded-full border border-white/20">{p.year}</span>}
              {best     && <span className="bg-emerald-500/20 text-accent-300 px-3 py-1 rounded-full border border-emerald-500/30">Best: {best}%</span>}
              {bestRank && <span className="bg-yellow-500/20 text-amber-300 px-3 py-1 rounded-full border border-yellow-500/30 flex items-center gap-1"><Medal size={14}/> Best Rank: #{bestRank}</span>}
            </div>
          </div>
          {total > 0 && (
            <div className="flex-shrink-0">
              <ScoreRing score={Math.round(parseFloat(avg || 0))} total={100} size={120} />
              <p className="text-center text-xs text-slate-400 mt-1">Overall Avg</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard icon={<Target size={24} />} label="Total Attempts" value={total}          color="blue" />
        <StatCard icon={<CheckCircle2 size={24} />} label="Quizzes Passed" value={passed}         color="green" />
        <StatCard icon={<TrendingUp size={24} />} label="Pass Rate"      value={`${passRate}%`} color="purple" />
        <StatCard icon={<Trophy size={24} />} label="Best Score"     value={best ? `${best}%` : '—'} color="orange" />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard icon={<BookOpen size={24} />} label="Courses Watched"   value={coursesStarted}   color="indigo" />
        <StatCard icon={<Award size={24} />} label="Courses Completed" value={coursesCompleted} color="green" />
      </div>

      {/* Course watch history */}
      <div className="bg-surface-card rounded-2xl border border-white/10 shadow-sm overflow-hidden mb-6">
        <div className="p-5 border-b border-white/10">
          <h3 className="text-sm font-black text-slate-300 uppercase tracking-wider">Course Progress</h3>
        </div>
        {courseProgress.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">No courses watched yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>{['Course', 'Category', 'Status', 'Views', 'Started', 'Completed'].map(h => (
                  <th key={h} className="text-left text-xs font-black text-slate-500 uppercase tracking-wider px-4 py-3">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {courseProgress.map(cp => (
                  <tr key={cp._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-100">{cp.courseId?.title || 'Course'}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{cp.courseId?.category || '—'}</td>
                    <td className="px-4 py-3">
                      {cp.status === 'completed'
                        ? <span className="inline-flex items-center gap-1 bg-accent-500/15 text-accent-400 text-xs font-black px-2.5 py-1 rounded-full">✓ Completed</span>
                        : <span className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-300 text-xs font-black px-2.5 py-1 rounded-full">▶ In Progress</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{cp.viewCount}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{new Date(cp.startedAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{cp.completedAt ? new Date(cp.completedAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {total === 0 ? (
        <EmptyState icon={<Inbox size={48} />} title="No quiz activity yet" description="This student hasn't attempted any quizzes so far." />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Score trend chart */}
            <div className="bg-surface-card rounded-2xl border border-white/10 shadow-sm p-5">
              <h3 className="text-sm font-black text-slate-300 uppercase tracking-wider mb-4">Score Trend</h3>
              <div>
                <div className="flex items-end gap-2 h-32 mb-2">
                  {trend.map((r, i) => {
                    const h = Math.max(4, (r.percentage / 100) * 100)
                    const color = r.percentage >= 75 ? 'bg-accent-500' : r.percentage >= 50 ? 'bg-amber-500' : 'bg-red-400'
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1" title={`${r.percentage?.toFixed(1)}%`}>
                        <span className="text-xs font-bold text-slate-400">{r.percentage?.toFixed(0)}%</span>
                        <div className={`w-full ${color} rounded-t-lg transition-all`} style={{ height: `${h}%` }} />
                      </div>
                    )
                  })}
                </div>
                <div className="flex gap-2 flex-wrap text-xs text-slate-500 justify-center mt-1">
                  {trend.map((r, i) => (
                    <span key={i}>{new Date(r.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Pass/Fail breakdown */}
            <div className="bg-surface-card rounded-2xl border border-white/10 shadow-sm p-5">
              <h3 className="text-sm font-black text-slate-300 uppercase tracking-wider mb-4">Quiz Performance</h3>
              <div className="flex items-center gap-6 mb-4">
                <div className="relative w-28 h-28 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3.8"/>
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" strokeWidth="3.8"
                      strokeDasharray={`${passRate} ${100-passRate}`} strokeDashoffset="0" strokeLinecap="round"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-lg font-black text-white">{passRate}%</p>
                  </div>
                </div>
                <div className="space-y-3 flex-1">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1"><span>Passed</span><span>{passed}</span></div>
                    <div className="w-full h-2 bg-white/5 rounded-full"><div className="h-full bg-accent-500 rounded-full" style={{ width: `${total ? ((passed / total) * 100) : 0}%` }}/></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1"><span>Failed</span><span>{failed}</span></div>
                    <div className="w-full h-2 bg-white/5 rounded-full"><div className="h-full bg-red-400 rounded-full" style={{ width: `${total ? ((failed / total) * 100) : 0}%` }}/></div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-xl font-black text-white">{avg}%</p>
                  <p className="text-xs text-slate-400">Average Score</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-xl font-black text-white">{best || '—'}%</p>
                  <p className="text-xs text-slate-400">Best Score</p>
                </div>
              </div>
            </div>
          </div>

          {/* Skill progress */}
          {skills.length > 0 && (
            <div className="bg-surface-card rounded-2xl border border-white/10 shadow-sm p-5 mb-6">
              <h3 className="text-sm font-black text-slate-300 uppercase tracking-wider mb-4">Skill Progress by Topic</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {skills.map(sk => (
                  <div key={sk.topic} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                      {sk.topic[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm font-bold text-slate-100 truncate">{sk.topic}</p>
                        <span className={`text-xs font-black px-2 py-0.5 rounded-full ml-2 ${getLevelColor(sk.avg)}`}>{getLevel(sk.avg)}</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${sk.avg >= 75 ? 'bg-accent-500' : sk.avg >= 50 ? 'bg-amber-500' : 'bg-red-400'}`} style={{ width: `${sk.avg}%` }}/>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{sk.avg.toFixed(1)}% · {sk.attempts} attempt{sk.attempts > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quiz history table */}
          <div className="bg-surface-card rounded-2xl border border-white/10 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-white/10">
              <h3 className="text-sm font-black text-slate-300 uppercase tracking-wider">Quiz History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>{['Quiz', 'Score', '%', 'Status', 'Rank', 'Date'].map(h => (
                    <th key={h} className="text-left text-xs font-black text-slate-500 uppercase tracking-wider px-4 py-3">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {results.map(r => (
                    <tr key={r._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-100">{r.quizId?.title || 'Quiz'}</td>
                      <td className="px-4 py-3 font-black">{r.score}/{r.totalMarks}</td>
                      <td className="px-4 py-3">
                        <span className={`font-bold ${r.percentage >= 75 ? 'text-accent-400' : r.percentage >= 50 ? 'text-amber-600' : 'text-red-400'}`}>{r.percentage?.toFixed(1)}%</span>
                      </td>
                      <td className="px-4 py-3"><PassBadge status={r.passStatus}/></td>
                      <td className="px-4 py-3">{r.rank ? `#${r.rank}` : '—'}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{new Date(r.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </Layout>
  )
}
