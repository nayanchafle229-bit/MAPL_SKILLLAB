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
          <h2 className="text-2xl font-black text-gray-900">📊 Student Progress</h2>
          <p className="text-gray-500 text-sm">Track quiz performance across all students</p>
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
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sort by:</span>
        {[
          { key:'recent',   label:'Most Recent' },
          { key:'best',     label:'Best Score' },
          { key:'attempts', label:'Most Attempts' },
        ].map(o => (
          <button key={o.key} onClick={() => setSortBy(o.key)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${sortBy===o.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {o.label}
          </button>
        ))}
      </div>

      {students.length === 0 ? (
        <EmptyState icon="👥" title="No students yet" description="Students will appear here after they register." />
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Student', 'Attempts', 'Passed', 'Avg %', 'Best %', 'Courses Watched', 'Courses Completed', 'Last Activity', ''].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sorted.map(s => (
                <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {(s.profile?.name || s.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{s.profile?.name || <span className="text-gray-400 italic">No name</span>}</p>
                        <p className="text-xs text-gray-400">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-700">{s.progress.totalAttempts}</td>
                  <td className="px-4 py-3 font-semibold text-emerald-600">{s.progress.passedCount}</td>
                  <td className="px-4 py-3 font-bold text-gray-800">{s.progress.avgPercentage || '—'}{s.progress.totalAttempts ? '%' : ''}</td>
                  <td className="px-4 py-3 font-bold text-gray-800">{s.progress.bestPercentage || '—'}{s.progress.totalAttempts ? '%' : ''}</td>
                  <td className="px-4 py-3 font-semibold text-gray-700">{s.progress.coursesStarted}</td>
                  <td className="px-4 py-3 font-semibold text-emerald-600">{s.progress.coursesCompleted}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {s.progress.lastAttemptAt
                      ? new Date(s.progress.lastAttemptAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
                      : <span className="text-gray-400">No activity</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/progress/${s._id}`}
                      className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-semibold transition-colors">
                      View Progress →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sorted.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">No students match your search.</div>
          )}
        </div>
      )}
    </Layout>
  )
}
