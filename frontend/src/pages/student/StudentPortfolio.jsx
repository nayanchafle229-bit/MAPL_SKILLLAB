import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import Layout from '../../components/Layout'
import { PageLoader, ScoreRing, PassBadge, StatCard } from '../../components/UI'

export default function StudentPortfolio() {
  const { user }  = useAuth()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/quiz/my-results')
      .then(({ data }) => setResults(data.results || []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Layout title="Portfolio"><PageLoader /></Layout>

  const p = user?.profile || {}
  const total   = results.length
  const passed  = results.filter(r=>r.passStatus==='PASS').length
  const failed  = total - passed
  const passRate= total ? ((passed/total)*100).toFixed(0) : 0
  const scores  = results.map(r=>r.percentage)
  const best    = scores.length ? Math.max(...scores).toFixed(1) : null
  const avg     = scores.length ? (scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(1) : null
  const bestRank= results.length ? Math.min(...results.filter(r=>r.rank).map(r=>r.rank)) : null

  // Skill levels derived from quiz performance per topic
  const topicMap = {}
  results.forEach(r => {
    const topic = r.quizId?.category || 'General'
    if (!topicMap[topic]) topicMap[topic] = { attempts:0, totalPct:0 }
    topicMap[topic].attempts++
    topicMap[topic].totalPct += r.percentage
  })
  const skills = Object.entries(topicMap).map(([topic, d]) => ({
    topic, avg: d.totalPct/d.attempts, attempts: d.attempts
  })).sort((a,b)=>b.avg-a.avg)

  // Score trend (last 8)
  const trend = results.slice(0,8).reverse()

  const getLevel = (pct) => pct>=85?'Expert':pct>=70?'Advanced':pct>=55?'Intermediate':'Beginner'
  const getLevelColor = (pct) => pct>=85?'text-emerald-600 bg-emerald-50':pct>=70?'text-blue-600 bg-blue-50':pct>=55?'text-amber-600 bg-amber-50':'text-gray-600 bg-gray-50'

  return (
    <Layout title="My Portfolio">
      {/* Profile hero */}
      <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-3xl p-6 mb-6 text-white">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl font-black shadow-xl flex-shrink-0">
            {(p.name||user?.email||'U')[0].toUpperCase()}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-2xl font-black mb-0.5">{p.name || 'Student'}</h2>
            <p className="text-blue-300 text-sm mb-1">{user?.email}</p>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start text-xs mt-2">
              {p.branch && <span className="bg-white/10 px-3 py-1 rounded-full border border-white/20">{p.branch}</span>}
              {p.year   && <span className="bg-white/10 px-3 py-1 rounded-full border border-white/20">{p.year}</span>}
              {best     && <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">Best: {best}%</span>}
              {bestRank && <span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full border border-yellow-500/30">🏅 Best Rank: #{bestRank}</span>}
            </div>
            {p.bio && <p className="text-slate-400 text-xs mt-3 max-w-md leading-relaxed">{p.bio}</p>}
          </div>
          {total > 0 && (
            <div className="flex-shrink-0">
              <ScoreRing score={Math.round(parseFloat(avg||0))} total={100} size={120}/>
              <p className="text-center text-xs text-slate-400 mt-1">Overall Avg</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon="🎯" label="Total Attempts" value={total}          color="blue"   />
        <StatCard icon="✅" label="Quizzes Passed" value={passed}         color="green"  />
        <StatCard icon="📈" label="Pass Rate"      value={`${passRate}%`} color="purple" />
        <StatCard icon="🏆" label="Best Score"     value={best ? `${best}%` : '—'} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Score trend chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-4">Score Trend</h3>
          {trend.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">Take quizzes to see your trend</div>
          ) : (
            <div>
              <div className="flex items-end gap-2 h-32 mb-2">
                {trend.map((r, i) => {
                  const h = Math.max(4, (r.percentage/100)*100)
                  const color = r.percentage>=75?'bg-emerald-500':r.percentage>=50?'bg-amber-500':'bg-red-400'
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1" title={`${r.percentage?.toFixed(1)}%`}>
                      <span className="text-xs font-bold text-gray-600">{r.percentage?.toFixed(0)}%</span>
                      <div className={`w-full ${color} rounded-t-lg transition-all`} style={{height:`${h}%`}}/>
                    </div>
                  )
                })}
              </div>
              <div className="flex gap-2 flex-wrap text-xs text-gray-400 justify-center mt-1">
                {trend.map((r, i) => (
                  <span key={i}>{new Date(r.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pass/Fail pie visual */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-4">Quiz Performance</h3>
          {total === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No quiz data yet</div>
          ) : (
            <div>
              <div className="flex items-center gap-6 mb-4">
                <div className="relative w-28 h-28 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3.8"/>
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" strokeWidth="3.8"
                      strokeDasharray={`${passRate} ${100-passRate}`} strokeDashoffset="0" strokeLinecap="round"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-lg font-black text-gray-900">{passRate}%</p>
                  </div>
                </div>
                <div className="space-y-3 flex-1">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1"><span>Passed</span><span>{passed}</span></div>
                    <div className="w-full h-2 bg-gray-100 rounded-full"><div className="h-full bg-emerald-500 rounded-full" style={{width:`${total?((passed/total)*100):0}%`}}/></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1"><span>Failed</span><span>{failed}</span></div>
                    <div className="w-full h-2 bg-gray-100 rounded-full"><div className="h-full bg-red-400 rounded-full" style={{width:`${total?((failed/total)*100):0}%`}}/></div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-black text-gray-900">{avg}%</p>
                  <p className="text-xs text-gray-500">Average Score</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-black text-gray-900">{best||'—'}%</p>
                  <p className="text-xs text-gray-500">Best Score</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Skill progress */}
      {skills.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-4">Skill Progress by Topic</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {skills.map(sk => (
              <div key={sk.topic} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                  {sk.topic[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-bold text-gray-800 truncate">{sk.topic}</p>
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full ml-2 ${getLevelColor(sk.avg)}`}>{getLevel(sk.avg)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${sk.avg>=75?'bg-emerald-500':sk.avg>=50?'bg-amber-500':'bg-red-400'}`} style={{width:`${sk.avg}%`}}/>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{sk.avg.toFixed(1)}% · {sk.attempts} attempt{sk.attempts>1?'s':''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quiz history table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider">Quiz History</h3>
          <Link to="/history" className="text-xs text-blue-600 font-bold hover:underline">View detailed →</Link>
        </div>
        {results.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 text-sm">No quiz attempts yet.</p>
            <Link to="/quizzes" className="mt-3 inline-block bg-blue-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl">Take a Quiz</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Quiz','Score','%','Status','Rank','Date'].map(h=>(
                  <th key={h} className="text-left text-xs font-black text-gray-400 uppercase tracking-wider px-4 py-3">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {results.map(r=>(
                  <tr key={r._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-800">{r.quizId?.title||'Quiz'}</td>
                    <td className="px-4 py-3 font-black">{r.score}/{r.totalMarks}</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${r.percentage>=75?'text-emerald-600':r.percentage>=50?'text-amber-600':'text-red-600'}`}>{r.percentage?.toFixed(1)}%</span>
                    </td>
                    <td className="px-4 py-3"><PassBadge status={r.passStatus}/></td>
                    <td className="px-4 py-3">{r.rank?`#${r.rank}`:'—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(r.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}
