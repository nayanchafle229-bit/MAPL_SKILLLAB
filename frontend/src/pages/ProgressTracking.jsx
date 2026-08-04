import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import Layout from '../components/Layout'
import { PageLoader, EmptyState, StatCard } from '../components/UI'

export default function ProgressTracking() {
  const [students, setStudents] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [sortBy,   setSortBy]   = useState('recent') // recent | best | attempts

  useEffect(() => {
    api.get('/progress/students')
      .then(({ data }) => setStudents(data.students || []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Layout title="Progress Tracking"><PageLoader /></Layout>

  const filtered = students.filter(s =>
    !search ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.profile?.name?.toLowerCase().includes(search.toLowerCase())
  )

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'best')     return (b.progress.bestPercentage) - (a.progress.bestPercentage)
    if (sortBy === 'attempts') return (b.progress.totalAttempts) - (a.progress.totalAttempts)
    // recent
    const at = a.progress.lastAttemptAt ? new Date(a.progress.lastAttemptAt).getTime() : 0
    const bt = b.progress.lastAttemptAt ? new Date(b.progress.lastAttemptAt).getTime() : 0
    return bt - at
  })

  const totalStudents = students.length
  const activeStudents = students.filter(s => s.progress.totalAttempts > 0).length
  const overallAvg = students.length
    ? (students.reduce((sum, s) => sum + (s.progress.avgPercentage || 0), 0) / students.length).toFixed(1)
    : 0
  const totalCoursesCompleted = students.reduce((sum, s) => sum + (s.progress.coursesCompleted || 0), 0)

  return (
    <Layout title="Progress Tracking">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-white">📊 Student Progress</h2>
          <p className="text-slate-400 text-sm">Track quiz performance across all students</p>
        </div>
        <input type="text" placeholder="🔍 Search students..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="input-field max-w-xs text-sm" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon="👥" label="Total Students"  value={totalStudents}      color="blue" />
        <StatCard icon="🎯" label="Active Students"  value={activeStudents}    color="green" />
        <StatCard icon="📈" label="Overall Avg Score" value={`${overallAvg}%`} color="purple" />
        <StatCard icon="📚" label="Courses Completed (All Students)" value={totalCoursesCompleted} color="orange" />
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sort by:</span>
        {[
          { key:'recent',   label:'Most Recent' },
          { key:'best',     label:'Best Score' },
          { key:'attempts', label:'Most Attempts' },
        ].map(o => (
          <button key={o.key} onClick={() => setSortBy(o.key)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${sortBy===o.key ? 'bg-primary-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
            {o.label}
          </button>
        ))}
      </div>

      {students.length === 0 ? (
        <EmptyState icon="👥" title="No students yet" description="Students will appear here after they register." />
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                {['Student', 'Attempts', 'Passed', 'Avg %', 'Best %', 'Courses Watched', 'Courses Completed', 'Last Activity', ''].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sorted.map(s => (
                <tr key={s._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {(s.profile?.name || s.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{s.profile?.name || <span className="text-slate-500 italic">No name</span>}</p>
                        <p className="text-xs text-slate-500">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-300">{s.progress.totalAttempts}</td>
                  <td className="px-4 py-3 font-semibold text-accent-400">{s.progress.passedCount}</td>
                  <td className="px-4 py-3 font-bold text-slate-100">{s.progress.avgPercentage || '—'}{s.progress.totalAttempts ? '%' : ''}</td>
                  <td className="px-4 py-3 font-bold text-slate-100">{s.progress.bestPercentage || '—'}{s.progress.totalAttempts ? '%' : ''}</td>
                  <td className="px-4 py-3 font-semibold text-slate-300">{s.progress.coursesStarted}</td>
                  <td className="px-4 py-3 font-semibold text-accent-400">{s.progress.coursesCompleted}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {s.progress.lastAttemptAt
                      ? new Date(s.progress.lastAttemptAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
                      : <span className="text-slate-500">No activity</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/progress/${s._id}`}
                      className="text-xs bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 px-3 py-1.5 rounded-lg font-semibold transition-colors">
                      View Progress →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {sorted.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm">No students match your search.</div>
          )}
        </div>
      )}
    </Layout>
  )
}
