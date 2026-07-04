import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import Layout from '../components/Layout'
import { PageLoader, EmptyState, PassBadge, StatCard } from '../components/UI'

function fmtTime(s){ const m=Math.floor((s||0)/60); return `${String(m).padStart(2,'0')}:${String((s||0)%60).padStart(2,'0')}` }

export default function History() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('all')

  useEffect(() => {
    api.get('/quiz/my-results')
      .then(({ data }) => setResults(data.results || []))
      .finally(() => setLoading(false))
  }, [])

  const filtered = results.filter(r => {
    const matchSearch = !search || r.quizId?.title?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter==='all'||(filter==='pass'?r.passStatus==='PASS':r.passStatus==='FAIL')
    return matchSearch && matchFilter
  })

  if (loading) return <Layout title="My Results"><PageLoader /></Layout>

  const passed = results.filter(r=>r.passStatus==='PASS').length
  const avg    = results.length ? (results.reduce((s,r)=>s+r.percentage,0)/results.length).toFixed(1) : 0
  const best   = results.length ? Math.max(...results.map(r=>r.percentage)).toFixed(1) : 0

  return (
    <Layout title="Result History">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">📊 Result History</h2>
          <p className="text-gray-500 text-sm">{results.length} total attempt{results.length!==1?'s':''}</p>
        </div>
        <Link to="/quizzes" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm">🧠 New Quiz</Link>
      </div>

      {/* Summary */}
      {results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard icon="🎯" label="Total Attempts" value={results.length} color="blue" />
          <StatCard icon="✅" label="Passed"          value={passed}         color="green" />
          <StatCard icon="🏆" label="Best Score"      value={`${best}%`}     color="orange" />
          <StatCard icon="📈" label="Average"         value={`${avg}%`}      color="purple" />
        </div>
      )}

      {results.length === 0 ? (
        <EmptyState icon="🎯" title="No quiz attempts yet"
          description="Take your first quiz to see your results here."
          action={<Link to="/quizzes" className="bg-blue-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm">Start Quiz</Link>} />
      ) : (
        <>
          {/* Filters */}
          <div className="flex gap-3 mb-4 flex-wrap items-center">
            <input type="text" placeholder="🔍 Search quizzes..."
              value={search} onChange={e=>setSearch(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-xs bg-white"/>
            <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-white">
              {[['all','All'],['pass','Passed'],['fail','Failed']].map(([v,l])=>(
                <button key={v} onClick={()=>setFilter(v)}
                  className={`px-4 py-2.5 text-sm font-bold transition-colors ${filter===v?'bg-blue-600 text-white':'text-gray-600 hover:bg-gray-50'}`}>{l}</button>
              ))}
            </div>
            <span className="text-sm text-gray-400 ml-auto">{filtered.length} results</span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>{['#','Quiz','Score','Percentage','Status','Rank','Time','Date',''].map(h=>(
                  <th key={h} className="text-left text-xs font-black text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((r, i) => {
                  const pct = r.percentage
                  const grade = pct>=90?'A+':pct>=75?'A':pct>=60?'B':pct>=50?'C':'F'
                  const gc   = pct>=75?'text-emerald-600 bg-emerald-50':pct>=50?'text-amber-600 bg-amber-50':'text-red-600 bg-red-50'
                  return (
                    <tr key={r._id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-3.5 text-xs font-bold text-gray-400">#{results.length-i}</td>
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-gray-900 text-sm">{r.quizId?.title||'Quiz'}</p>
                        {r.quizId?.category && <p className="text-xs text-gray-400">{r.quizId.category}</p>}
                      </td>
                      <td className="px-4 py-3.5 font-black text-gray-900">{r.score}/{r.totalMarks}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${pct>=75?'bg-emerald-500':pct>=50?'bg-amber-500':'bg-red-500'}`} style={{width:`${pct}%`}}/>
                          </div>
                          <span className={`font-black text-xs px-2 py-0.5 rounded-full ${gc}`}>{pct.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5"><PassBadge status={r.passStatus}/></td>
                      <td className="px-4 py-3.5 font-bold text-gray-700">{r.rank?`#${r.rank}`:'—'}</td>
                      <td className="px-4 py-3.5 font-mono text-xs text-gray-500">{fmtTime(r.timeTaken)}</td>
                      <td className="px-4 py-3.5 text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</td>
                      <td className="px-4 py-3.5">
                        <Link to={`/result/${r._id}`} className="text-xs text-blue-600 font-bold hover:underline">Review →</Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="text-center py-10 text-gray-400 text-sm">No results match your filter.</div>}
          </div>
        </>
      )}
    </Layout>
  )
}
