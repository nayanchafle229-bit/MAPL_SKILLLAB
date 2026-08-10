import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import Layout from '../components/Layout'
import { StatCard, PageLoader, PassBadge } from '../components/UI'

export default function Dashboard() {
  const { user }  = useAuth()
  const [results, setResults]  = useState([])
  const [quizzes, setQuizzes]  = useState([])
  const [loading, setLoading]  = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/quiz/my-results').catch(() => ({ data:{ results:[] } })),
      api.get('/quiz').catch(() => ({ data:{ quizzes:[] } })),
    ]).then(([rRes, qRes]) => {
      setResults(rRes.data.results || [])
      setQuizzes((qRes.data.quizzes || []).slice(0, 4))
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <Layout title="Dashboard"><PageLoader /></Layout>

  const p       = user?.profile || {}
  const total   = results.length
  const passed  = results.filter(r=>r.passStatus==='PASS').length
  const best    = results.length ? Math.max(...results.map(r=>r.percentage)) : null
  const avg     = results.length ? (results.reduce((s,r)=>s+r.percentage,0)/results.length).toFixed(1) : null
  const bestRank= results.filter(r=>r.rank).length ? Math.min(...results.filter(r=>r.rank).map(r=>r.rank)) : null
  const pending = quizzes.filter(q=>!q.attempted).length

  return (
    <Layout title="Dashboard">
      {/* Premium Welcome Hero */}
      <div className="relative rounded-3xl p-8 mb-8 text-white overflow-hidden shadow-2xl animate-fade-in group">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-accent-600 to-indigo-900 z-0"></div>
        <div className="absolute inset-0 opacity-30 mix-blend-overlay z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        
        {/* Glass Orbs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl z-0 group-hover:bg-white/20 transition-all duration-1000"></div>
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-primary-400/20 rounded-full blur-3xl z-0 group-hover:bg-primary-400/30 transition-all duration-1000"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-4 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] font-bold tracking-widest uppercase text-white/90">Student Portal</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black mb-2 tracking-tight drop-shadow-md">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-primary-200">{p.name?.split(' ')[0] || 'Learner'}</span> 👋
            </h2>
            
            <p className="text-primary-100/80 text-sm md:text-base font-medium max-w-xl">
              {p.branch && `${p.branch} · `}{p.year || 'Your journey to mastery continues today. Keep pushing your limits!'}
            </p>
            
            {pending > 0 && (
              <div className="mt-6 flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1,2,3].slice(0, pending).map(i => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 border-2 border-primary-600 shadow-sm z-10 flex items-center justify-center text-[10px]">🧠</div>
                  ))}
                  {pending > 3 && <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 z-0 flex items-center justify-center text-[10px] font-bold">+{pending-3}</div>}
                </div>
                <p className="text-white text-sm font-semibold drop-shadow-sm">
                  {pending} new quiz{pending>1?'zes':''} waiting for you!
                </p>
              </div>
            )}
          </div>
          
          <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto">
            <Link to="/quizzes" className="flex-1 md:flex-none text-center bg-white text-primary-700 font-black px-6 py-3.5 rounded-xl hover:bg-primary-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]">
              🚀 Explore Quizzes
            </Link>
            <Link to="/portfolio" className="flex-1 md:flex-none text-center bg-white/10 border border-white/20 text-white font-bold px-6 py-3.5 rounded-xl hover:bg-white/20 transition-all backdrop-blur-md hover:-translate-y-1">
              📊 View Portfolio
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon="🎯" label="Quizzes Attempted" value={total}                           color="blue"   />
        <StatCard icon="✅" label="Passed"              value={passed}                          color="green"  />
        <StatCard icon="🏆" label="Best Score"          value={best ? `${best.toFixed(1)}%` : '—'} color="orange" />
        <StatCard icon="🏅" label="Best Rank"           value={bestRank ? `#${bestRank}` : '—'}    color="purple" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Available Quizzes */}
        <div className="glass-panel overflow-hidden flex flex-col h-[400px]">
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/[0.02]">
            <h3 className="font-black text-white text-base tracking-wide flex items-center gap-2">
              <span className="text-xl">🧠</span> Available Quizzes
            </h3>
            <Link to="/quizzes" className="text-xs bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 hover:text-primary-300 font-bold px-3 py-1.5 rounded-lg transition-colors border border-primary-500/20">View all</Link>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {quizzes.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                <span className="text-4xl mb-2">🍃</span>
                <p className="text-slate-400 text-sm font-medium">No new quizzes available right now.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {quizzes.map(q => (
                  <div key={q._id} className="group relative flex items-center gap-4 px-4 py-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/20 rounded-xl transition-all duration-300 hover:shadow-lg overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 via-primary-500/0 to-primary-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-primary-500/30 rounded-xl flex items-center justify-center text-white font-black text-lg flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300 z-10">
                      {q.title[0]}
                    </div>
                    
                    <div className="flex-1 min-w-0 z-10">
                      <p className="font-bold text-white text-sm truncate group-hover:text-primary-200 transition-colors">{q.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{q.totalQuestions}Q</span>
                        <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{q.totalMarks}M</span>
                        <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{q.duration}m</span>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0 z-10">
                      {q.attempted ? (
                        <div className="text-right">
                          <PassBadge status={q.myStatus} />
                          <p className="text-xs font-black text-slate-400 mt-1">{q.myPct?.toFixed(0)}%</p>
                        </div>
                      ) : (
                        <Link to={`/quiz/${q._id}`} className="text-xs bg-white text-primary-900 font-black px-4 py-2 rounded-xl transition-all shadow-[0_0_10px_rgba(255,255,255,0.2)] hover:shadow-[0_0_15px_rgba(255,255,255,0.4)] hover:-translate-y-0.5 inline-block">
                          Start
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Results */}
        <div className="glass-panel overflow-hidden flex flex-col h-[400px]">
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/[0.02]">
            <h3 className="font-black text-white text-base tracking-wide flex items-center gap-2">
              <span className="text-xl">📊</span> Recent Results
            </h3>
            <Link to="/history" className="text-xs bg-accent-500/10 text-accent-400 hover:bg-accent-500/20 hover:text-accent-300 font-bold px-3 py-1.5 rounded-lg transition-colors border border-accent-500/20">View all</Link>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {results.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                <span className="text-4xl mb-2">🎯</span>
                <p className="text-slate-400 text-sm font-medium">No quiz attempts yet.</p>
                <Link to="/quizzes" className="mt-4 inline-block bg-primary-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg">Take a quiz</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {results.slice(0, 5).map(r => {
                  const pct = r.percentage
                  return (
                    <Link to={`/result/${r._id}`} key={r._id}
                      className="group relative flex items-center justify-between px-4 py-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/20 rounded-xl transition-all duration-300 hover:shadow-lg overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-accent-500/0 via-accent-500/0 to-accent-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      <div className="min-w-0 flex-1 z-10">
                        <p className="font-bold text-white text-sm truncate group-hover:text-accent-200 transition-colors">{r.quizId?.title||'Quiz'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                            {new Date(r.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'2-digit'})}
                          </span>
                          {r.rank && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                              <span className="text-[10px] uppercase tracking-wider font-black text-amber-400">Rank #{r.rank}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 ml-3 flex-shrink-0 z-10">
                        <div className="text-right">
                          <p className="font-black text-sm text-white">{r.score}<span className="text-[10px] text-slate-500">/{r.totalMarks}</span></p>
                          <PassBadge status={r.passStatus} />
                        </div>
                        <div className="relative w-12 h-12 flex items-center justify-center">
                          <svg width="48" height="48" className="-rotate-90 drop-shadow-md">
                            <circle cx="24" cy="24" r="20" stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="none"/>
                            <circle cx="24" cy="24" r="20" stroke={pct>=75?'#10b981':pct>=50?'#f59e0b':'#ef4444'} strokeWidth="4" fill="none"
                              strokeDasharray="125.6" strokeDashoffset={125.6 - (pct/100)*125.6} strokeLinecap="round"/>
                          </svg>
                          <span className="absolute text-[10px] font-black text-white">{pct.toFixed(0)}%</span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom CTA row */}
      {total > 0 && (
        <div className="mt-8 glass-panel relative overflow-hidden p-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-white group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-accent-600/20 opacity-50 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="relative z-10 flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-3xl shadow-inner backdrop-blur-sm border border-white/20">
              {best >= 75 ? '🌟' : best >= 50 ? '📚' : '💪'}
            </div>
            <div>
              <p className="font-black text-xl tracking-wide">
                {best >= 75 ? 'Outstanding performance!' : best >= 50 ? 'Keep climbing higher!' : 'Ready for a comeback!'}
              </p>
              <p className="text-slate-400 text-sm mt-1 font-medium">
                {total} attempt{total>1?'s':''} · <span className="text-slate-300 font-bold">Avg {avg||0}%</span> · <span className="text-slate-300 font-bold">Best {best?.toFixed(1)||0}%</span>
              </p>
            </div>
          </div>
          
          <div className="relative z-10 flex gap-3 w-full sm:w-auto">
            <Link to="/quizzes"   className="flex-1 sm:flex-none text-center text-sm bg-primary-600 hover:bg-primary-500 text-white font-black px-6 py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:-translate-y-0.5">🧠 New Quiz</Link>
            <Link to="/portfolio" className="flex-1 sm:flex-none text-center text-sm bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl border border-white/20 transition-all hover:-translate-y-0.5">📊 Portfolio</Link>
          </div>
        </div>
      )}
    </Layout>
  )
}
