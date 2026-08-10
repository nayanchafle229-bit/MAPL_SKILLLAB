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
  const getLevelColor = (pct) => pct>=85?'text-accent-400 bg-accent-500/10':pct>=70?'text-primary-400 bg-primary-500/10':pct>=55?'text-amber-600 bg-amber-500/10':'text-slate-400 bg-white/5'

  return (
    <Layout title="My Portfolio">
      {/* Profile hero */}
      <div className="bg-gradient-to-br from-surface-card to-primary-900 rounded-3xl p-6 mb-6 text-white">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-accent-500 rounded-2xl flex items-center justify-center text-3xl font-black shadow-xl flex-shrink-0">
            {(p.name||user?.email||'U')[0].toUpperCase()}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-2xl font-black mb-0.5">{p.name || 'Student'}</h2>
            <p className="text-blue-300 text-sm mb-1">{user?.email}</p>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start text-xs mt-2">
              {p.branch && <span className="bg-white/10 px-3 py-1 rounded-full border border-white/20">{p.branch}</span>}
              {p.year   && <span className="bg-white/10 px-3 py-1 rounded-full border border-white/20">{p.year}</span>}
              {best     && <span className="bg-emerald-500/20 text-accent-300 px-3 py-1 rounded-full border border-emerald-500/30">Best: {best}%</span>}
              {bestRank && <span className="bg-yellow-500/20 text-amber-300 px-3 py-1 rounded-full border border-yellow-500/30">🏅 Best Rank: #{bestRank}</span>}
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
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest mb-4">Score Trend</h3>
          {trend.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-3xl opacity-50 mb-2 block">📈</span>
              <p className="text-slate-400 text-sm font-bold">Take quizzes to see your trend</p>
            </div>
          ) : (
            <div>
              <div className="flex items-end gap-3 h-32 mb-3">
                {trend.map((r, i) => {
                  const h = Math.max(4, (r.percentage/100)*100)
                  const color = r.percentage>=75?'bg-emerald-500':r.percentage>=50?'bg-amber-500':'bg-red-500'
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group" title={`${r.percentage?.toFixed(1)}%`}>
                      <span className="text-[10px] font-black text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">{r.percentage?.toFixed(0)}%</span>
                      <div className={`w-full ${color} rounded-t-xl transition-all shadow-inner group-hover:brightness-110`} style={{height:`${h}%`}}/>
                    </div>
                  )
                })}
              </div>
              <div className="flex gap-2 flex-wrap text-[10px] uppercase tracking-widest font-bold text-slate-500 justify-center mt-2">
                {trend.map((r, i) => (
                  <span key={i} className="bg-white/5 px-2 py-1 rounded-md">{new Date(r.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pass/Fail pie visual */}
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest mb-4">Quiz Performance</h3>
          {total === 0 ? (
            <div className="text-center py-12">
              <span className="text-3xl opacity-50 mb-2 block">📊</span>
              <p className="text-slate-400 text-sm font-bold">No quiz data yet</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-8 mb-6">
                <div className="relative w-32 h-32 flex-shrink-0 drop-shadow-xl">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3.8"/>
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" strokeWidth="3.8"
                      strokeDasharray={`${passRate} ${100-passRate}`} strokeDashoffset="0" strokeLinecap="round"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <p className="text-2xl font-black text-white leading-none">{passRate}%</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Pass Rate</p>
                  </div>
                </div>
                <div className="space-y-4 flex-1">
                  <div>
                    <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest mb-2"><span>Passed</span><span className="text-emerald-400">{passed}</span></div>
                    <div className="w-full h-2 bg-white/10 rounded-full shadow-inner overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{width:`${total?((passed/total)*100):0}%`}}/></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest mb-2"><span>Failed</span><span className="text-red-400">{failed}</span></div>
                    <div className="w-full h-2 bg-white/10 rounded-full shadow-inner overflow-hidden"><div className="h-full bg-red-500 rounded-full" style={{width:`${total?((failed/total)*100):0}%`}}/></div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center shadow-inner">
                  <p className="text-2xl font-black text-white mb-1">{avg}%</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Average Score</p>
                </div>
                <div className="bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-primary-500/20 rounded-2xl p-4 text-center shadow-inner">
                  <p className="text-2xl font-black text-primary-300 mb-1">{best||'—'}%</p>
                  <p className="text-[10px] font-bold text-primary-400 uppercase tracking-widest">Best Score</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Skill progress */}
      {skills.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl mb-6">
          <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest mb-5">Skill Progress by Topic</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skills.map(sk => (
              <div key={sk.topic} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors group">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-primary-600/20 border border-primary-500/30 rounded-xl flex items-center justify-center text-primary-400 font-black text-lg flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                  {sk.topic[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-black text-white truncate group-hover:text-primary-300 transition-colors">{sk.topic}</p>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ml-2 border ${getLevelColor(sk.avg)}`}>{getLevel(sk.avg)}</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden shadow-inner mb-1.5">
                    <div className={`h-full rounded-full ${sk.avg>=75?'bg-emerald-500':sk.avg>=50?'bg-amber-500':'bg-red-500'}`} style={{width:`${sk.avg}%`}}/>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sk.avg.toFixed(1)}% <span className="opacity-50 mx-1">•</span> {sk.attempts} attempt{sk.attempts>1?'s':''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quiz history table */}
      <div className="glass-panel overflow-hidden p-0 rounded-2xl">
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest">Quiz History</h3>
          <Link to="/history" className="text-xs text-primary-400 font-bold hover:text-primary-300 transition-colors uppercase tracking-widest">View detailed →</Link>
        </div>
        {results.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-3xl opacity-50 mb-3 block">📝</span>
            <p className="text-slate-400 text-sm font-bold mb-4">No quiz attempts yet.</p>
            <Link to="/quizzes" className="btn-primary inline-flex">Take a Quiz</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>{['Quiz','Score','%','Status','Rank','Date'].map(h=>(
                  <th key={h} className="text-left text-xs font-black text-slate-400 uppercase tracking-widest px-6 py-4">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {results.map(r=>(
                  <tr key={r._id} className="hover:bg-white/[0.05] transition-colors group">
                    <td className="px-6 py-4 font-bold text-white group-hover:text-primary-300 transition-colors">{r.quizId?.title||'Quiz'}</td>
                    <td className="px-6 py-4 font-black text-white">{r.score}<span className="text-slate-500 text-xs font-bold">/{r.totalMarks}</span></td>
                    <td className="px-6 py-4">
                      <span className={`font-black ${r.percentage>=75?'text-emerald-400':r.percentage>=50?'text-amber-400':'text-red-400'}`}>{r.percentage?.toFixed(1)}%</span>
                    </td>
                    <td className="px-6 py-4"><PassBadge status={r.passStatus}/></td>
                    <td className="px-6 py-4 font-black text-primary-300 drop-shadow-sm">{r.rank?`#${r.rank}`:'—'}</td>
                    <td className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</td>
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
