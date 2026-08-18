import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Hand, BrainCircuit, Rocket, BarChart3, Target, CheckCircle2, Trophy, Medal, Leaf, Star, BookOpen, Dumbbell } from 'lucide-react'
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
      {/* ═══ System Overview Panel ═══ */}
      <div className="relative rounded-3xl p-8 mb-8 text-white overflow-hidden shadow-2xl animate-fade-in group border border-line hazard-edge">
        {/* Control-room base: graphite + blueprint grid + amber/trace-blue glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-surface-raised via-surface-card to-surface-base z-0"></div>
        <div className="absolute inset-0 z-0 opacity-70 blueprint-bg"></div>
        <div className="absolute inset-0 opacity-40 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-secondary-500/20 via-transparent to-transparent"></div>

        {/* Ambient glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-secondary-500/15 rounded-full blur-3xl z-0 group-hover:bg-secondary-500/20 transition-all duration-1000"></div>
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-primary-500/15 rounded-full blur-3xl z-0 group-hover:bg-primary-500/25 transition-all duration-1000"></div>

        {/* Floating decorative particles */}
        <div className="absolute top-10 right-40 w-2 h-2 bg-primary-300/40 rounded-full animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute top-20 right-20 w-1 h-1 bg-secondary-300/40 rounded-full animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-40 w-1.5 h-1.5 bg-primary-300/30 rounded-full animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="nameplate mb-4">
              <span className="led-dot is-live"></span>
              Student Portal · Session Active
            </div>
            
            <h2 className="text-4xl md:text-5xl font-display font-black mb-2 tracking-tight drop-shadow-md">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-secondary-300">{p.name?.split(' ')[0] || 'Learner'}</span> <Hand size={36} className="inline-block" />
            </h2>
            
            <p className="text-slate-400 text-sm md:text-base font-medium max-w-xl">
              {p.branch && `${p.branch} · `}{p.year || 'Your journey to mastery continues today. Keep pushing your limits!'}
            </p>
            
            {pending > 0 && (
              <div className="mt-6 flex items-center gap-3 animate-slide-up" style={{ animationDelay: '200ms' }}>
                <div className="flex -space-x-2">
                  {[1,2,3].slice(0, pending).map(i => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 border-2 border-surface-card shadow-sm z-10 flex items-center justify-center text-[10px] animate-float" style={{ animationDelay: `${i * 300}ms` }}><BrainCircuit size={14} /></div>
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
            <Link to="/quizzes" className="flex-1 md:flex-none text-center bg-primary-500 text-[#1a1206] font-black px-6 py-3.5 rounded-xl hover:bg-primary-400 transition-all shadow-glow-primary hover:-translate-y-1 relative overflow-hidden group/btn">
              <span className="relative z-10"><Rocket size={16} className="inline-block mr-1" /> Explore Quizzes</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s linear infinite' }} />
            </Link>
            <Link to="/portfolio" className="flex-1 md:flex-none text-center bg-white/5 border border-line text-white font-bold px-6 py-3.5 rounded-xl hover:bg-white/10 transition-all backdrop-blur-md hover:-translate-y-1">
              <BarChart3 size={16} className="inline-block mr-1" /> View Portfolio
            </Link>
          </div>
        </div>
      </div>

      {/* ═══ Stats Grid ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="animate-slide-up stagger-1"><StatCard icon={<Target size={24} />} label="Quizzes Attempted" value={total}                           color="blue"   /></div>
        <div className="animate-slide-up stagger-2"><StatCard icon={<CheckCircle2 size={24} />} label="Passed"              value={passed}                          color="green"  /></div>
        <div className="animate-slide-up stagger-3"><StatCard icon={<Trophy size={24} />} label="Best Score"          value={best ? `${best.toFixed(1)}%` : '—'} color="orange" /></div>
        <div className="animate-slide-up stagger-4"><StatCard icon={<Medal size={24} />} label="Best Rank"           value={bestRank ? `#${bestRank}` : '—'}    color="purple" /></div>
      </div>

      {/* ═══ Two Column Content ═══ */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Available Quizzes */}
        <div className="glass-panel overflow-hidden flex flex-col h-[400px] animate-slide-up stagger-5">
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/[0.02]">
            <h3 className="font-black text-white text-base tracking-wide flex items-center gap-2">
              <BrainCircuit size={20} /> Available Quizzes
            </h3>
            <Link to="/quizzes" className="text-xs bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 hover:text-primary-300 font-bold px-3 py-1.5 rounded-lg transition-all border border-primary-500/20 hover:-translate-y-0.5">View all</Link>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {quizzes.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                <span className="mb-2 animate-float"><Leaf size={36} className="opacity-60" /></span>
                <p className="text-slate-400 text-sm font-medium">No new quizzes available right now.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {quizzes.map((q, idx) => (
                  <div key={q._id} className="group relative flex items-center gap-4 px-4 py-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-primary-500/20 rounded-xl transition-all duration-300 hover:shadow-lg overflow-hidden animate-slide-left" style={{ animationDelay: `${idx * 80}ms` }}>
                    {/* Hover gradient reveal */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 via-primary-500/0 to-primary-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-primary-500/30 rounded-xl flex items-center justify-center text-white font-black text-lg flex-shrink-0 shadow-inner group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all duration-300 z-10">
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
                        <Link to={`/quiz/${q._id}`} className="text-xs bg-white text-primary-900 font-black px-4 py-2 rounded-xl transition-all shadow-[0_0_10px_rgba(255,255,255,0.2)] hover:shadow-[0_0_15px_rgba(255,255,255,0.4)] hover:-translate-y-0.5 inline-block relative overflow-hidden group/start">
                          <span className="relative z-10">Start</span>
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
        <div className="glass-panel overflow-hidden flex flex-col h-[400px] animate-slide-up stagger-6">
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/[0.02]">
            <h3 className="font-black text-white text-base tracking-wide flex items-center gap-2">
              <BarChart3 size={20} /> Recent Results
            </h3>
            <Link to="/history" className="text-xs bg-accent-500/10 text-accent-400 hover:bg-accent-500/20 hover:text-accent-300 font-bold px-3 py-1.5 rounded-lg transition-all border border-accent-500/20 hover:-translate-y-0.5">View all</Link>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {results.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                <span className="mb-2 animate-float"><Target size={36} className="opacity-60" /></span>
                <p className="text-slate-400 text-sm font-medium">No quiz attempts yet.</p>
                <Link to="/quizzes" className="mt-4 inline-block bg-primary-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg hover:-translate-y-0.5 transition-all">Take a quiz</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {results.slice(0, 5).map((r, idx) => {
                  const pct = r.percentage
                  return (
                    <Link to={`/result/${r._id}`} key={r._id}
                      className="group relative flex items-center justify-between px-4 py-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-accent-500/20 rounded-xl transition-all duration-300 hover:shadow-lg overflow-hidden animate-slide-left" style={{ animationDelay: `${idx * 80}ms` }}>
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
                          <p className="font-mono font-black text-sm text-white">{r.score}<span className="text-[10px] text-slate-500">/{r.totalMarks}</span></p>
                          <PassBadge status={r.passStatus} />
                        </div>
                        <div className="relative w-12 h-12 flex items-center justify-center">
                          <svg width="48" height="48" className="-rotate-90 drop-shadow-md">
                            <circle cx="24" cy="24" r="20" stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="none"/>
                            <circle cx="24" cy="24" r="20" stroke={pct>=75?'#10b981':pct>=50?'#f59e0b':'#ef4444'} strokeWidth="4" fill="none"
                              strokeDasharray="125.6" strokeDashoffset={125.6 - (pct/100)*125.6} strokeLinecap="round"
                              style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)', filter: `drop-shadow(0 0 4px ${pct>=75?'rgba(16,185,129,0.5)':pct>=50?'rgba(245,158,11,0.5)':'rgba(239,68,68,0.5)'})` }}/>
                          </svg>
                          <span className="absolute text-[10px] font-mono font-black text-white">{pct.toFixed(0)}%</span>
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

      {/* ═══ Bottom CTA Bar ═══ */}
      {total > 0 && (
        <div className="mt-8 glass-panel relative overflow-hidden p-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-white group animate-slide-up stagger-7 gradient-border">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-accent-600/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
          
          {/* Animated particle dots */}
          <div className="absolute top-4 right-20 w-1 h-1 bg-primary-400/40 rounded-full animate-float" />
          <div className="absolute bottom-4 left-40 w-1.5 h-1.5 bg-secondary-400/30 rounded-full animate-float" style={{ animationDelay: '1s' }} />
          
          <div className="relative z-10 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-3xl shadow-inner backdrop-blur-sm border border-white/20 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-shadow duration-500 animate-float">
              {best >= 75 ? <Star size={28} /> : best >= 50 ? <BookOpen size={28} /> : <Dumbbell size={28} />}
            </div>
            <div>
              <p className="font-display font-black text-xl tracking-wide">
                {best >= 75 ? 'Outstanding performance!' : best >= 50 ? 'Keep climbing higher!' : 'Ready for a comeback!'}
              </p>
              <p className="text-slate-400 text-sm mt-1 font-medium">
                {total} attempt{total>1?'s':''} · <span className="text-slate-300 font-bold">Avg {avg||0}%</span> · <span className="text-slate-300 font-bold">Best {best?.toFixed(1)||0}%</span>
              </p>
            </div>
          </div>
          
          <div className="relative z-10 flex gap-3 w-full sm:w-auto">
            <Link to="/quizzes"   className="flex-1 sm:flex-none text-center text-sm btn-primary"><BrainCircuit size={16} className="inline-block mr-1 -mt-0.5" /> New Quiz</Link>
            <Link to="/portfolio" className="flex-1 sm:flex-none text-center text-sm btn-secondary"><BarChart3 size={16} className="inline-block mr-1 -mt-0.5" /> Portfolio</Link>
          </div>
        </div>
      )}
    </Layout>
  )
}
