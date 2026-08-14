import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BrainCircuit, HelpCircle, BookOpen, Users, Target, Inbox, Trophy, TrendingDown } from 'lucide-react'
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
    { to:'/admin/quizzes/create', icon:<BrainCircuit size={24} />, label:'Create Quiz',      desc:'New difficulty-based quiz', color:'bg-primary-600' },
    { to:'/admin/questions',      icon:<HelpCircle size={24} />, label:'Add Questions',     desc:'Manage question bank',      color:'bg-purple-600' },
    { to:'/admin/courses',        icon:<BookOpen size={24} />, label:'Add Course',        desc:'Upload course + video',     color:'bg-emerald-600' },
    { to:'/admin/users',          icon:<Users size={24} />, label:'View Users',        desc:'All registered students',   color:'bg-orange-500' },
  ]

  return (
    <Layout title="Admin Dashboard">
      {/* Premium Hero */}
      <div className="relative rounded-3xl p-8 mb-8 text-white overflow-hidden shadow-2xl animate-fade-in group">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 z-0"></div>
        <div className="absolute inset-0 opacity-40 mix-blend-overlay z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-400/20 via-transparent to-transparent"></div>
        
        {/* Glass Orbs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl z-0 group-hover:bg-primary-500/20 transition-all duration-1000"></div>
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-accent-500/10 rounded-full blur-3xl z-0 group-hover:bg-accent-500/20 transition-all duration-1000"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-2xl flex items-center justify-center text-3xl shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-2">
                <span className="text-[10px] font-black tracking-widest uppercase text-slate-300">System Control</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight drop-shadow-md">Administrator Panel</h2>
              <p className="text-slate-400 text-sm md:text-base font-medium mt-1">Smart Quiz & Evaluation System — Full Access</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              [<Users size={28} />, stats?.totalUsers||0, 'Students', 'from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400'],
              [<HelpCircle size={28} />, stats?.totalQuestions||0, 'Questions', 'from-purple-500/20 to-purple-600/5 border-purple-500/20 text-purple-400'],
              [<BrainCircuit size={28} />, stats?.totalQuizzes||stats?.totalCourses||0, 'Quizzes', 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400'],
              [<Target size={28} />, stats?.totalAttempts||0, 'Attempts', 'from-amber-500/20 to-amber-600/5 border-amber-500/20 text-amber-400']
            ].map(([ic,v,l,colorClass])=>(
              <div key={l} className={`bg-gradient-to-b ${colorClass} border rounded-2xl p-5 text-center backdrop-blur-md shadow-inner transition-transform hover:-translate-y-1 duration-300`}>
                <span className="text-3xl drop-shadow-sm">{ic}</span>
                <p className="text-3xl font-black text-white mt-2 drop-shadow-sm">{v}</p>
                <p className="text-[10px] uppercase tracking-widest font-bold opacity-80 mt-1">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {quickLinks.map(l => (
          <Link key={l.to} to={l.to}
            className="glass-panel overflow-hidden p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative hover:border-white/20">
            <div className={`absolute top-0 right-0 w-32 h-32 ${l.color.replace('bg-','bg-')}/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 group-hover:bg-opacity-20 transition-all duration-500 z-0`}></div>
            
            <div className="relative z-10">
              <div className={`w-12 h-12 ${l.color} bg-opacity-20 border border-white/10 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                {l.icon}
              </div>
              <h3 className="font-black text-white text-base group-hover:text-primary-300 transition-colors tracking-wide">{l.label}</h3>
              <p className="text-xs text-slate-400 mt-1.5 font-medium leading-relaxed">{l.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Recent quizzes */}
        <div className="glass-panel overflow-hidden flex flex-col h-[400px]">
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/[0.02]">
            <h3 className="font-black text-white text-base tracking-wide flex items-center gap-2">
              <BrainCircuit size={20} /> Recent Quizzes
            </h3>
            <Link to="/admin/quizzes" className="text-[10px] uppercase tracking-widest bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 font-black px-3 py-1.5 rounded-lg transition-colors border border-primary-500/20">View all</Link>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {quizzes.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                <Inbox size={36} className="mb-3 mx-auto" />
                <p className="text-slate-400 text-sm font-medium">No quizzes created yet.</p>
                <Link to="/admin/quizzes/create" className="mt-4 inline-block text-xs bg-primary-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg">+ Create Quiz</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {quizzes.map(q => (
                  <div key={q._id} className="group flex items-center justify-between px-4 py-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/20 rounded-xl transition-all duration-300">
                    <div className="min-w-0 flex-1 pr-4">
                      <p className="font-bold text-white text-sm truncate group-hover:text-primary-200 transition-colors">{q.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{q.totalQuestions}Q</span>
                        <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{q.totalMarks}M</span>
                        <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{q.attemptCount||0} attempts</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`text-[10px] uppercase tracking-widest font-black px-3 py-1 rounded-full shadow-inner border ${q.isActive?'bg-emerald-500/15 text-emerald-400 border-emerald-500/30':'bg-white/5 text-slate-400 border-white/10'}`}>
                        {q.isActive?'Active':'Off'}
                      </span>
                      <Link to={`/admin/quizzes/${q._id}/leaderboard`} className="w-8 h-8 flex items-center justify-center bg-primary-500/10 text-primary-400 rounded-lg hover:bg-primary-500/20 transition-colors border border-primary-500/20" title="Leaderboard">
                        <Trophy size={16} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent results */}
        <div className="glass-panel overflow-hidden flex flex-col h-[400px]">
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/[0.02]">
            <h3 className="font-black text-white text-base tracking-wide flex items-center gap-2">
              <Trophy size={20} /> Recent Results
            </h3>
            <Link to="/admin/results" className="text-[10px] uppercase tracking-widest bg-accent-500/10 text-accent-400 hover:bg-accent-500/20 font-black px-3 py-1.5 rounded-lg transition-colors border border-accent-500/20">View all</Link>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {results.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                <TrendingDown size={36} className="mb-3 mx-auto" />
                <p className="text-slate-400 text-sm font-medium">No results recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {results.map(r => {
                  const pct = r.percentage
                  return (
                    <div key={r._id} className="group flex items-center justify-between px-4 py-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/20 rounded-xl transition-all duration-300">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500/20 to-primary-600/20 border border-primary-500/30 rounded-xl flex items-center justify-center text-primary-300 font-black text-sm flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                          {(r.userId?.profile?.name||r.userId?.email||'U')[0].toUpperCase()}
                        </div>
                        <div className="min-w-0 pr-4">
                          <p className="font-bold text-white text-sm truncate group-hover:text-primary-200 transition-colors">{r.userId?.profile?.name||'Student'}</p>
                          <p className="text-[10px] font-medium text-slate-400 truncate mt-0.5">{r.userId?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-right">
                          <span className="font-black text-sm text-white">{r.score}<span className="text-[10px] text-slate-500 font-bold">/{r.totalMarks}</span></span>
                        </div>
                        <span className={`text-[10px] uppercase tracking-widest font-black px-3 py-1.5 rounded-full shadow-inner border ${r.passStatus==='PASS'?'bg-emerald-500/15 text-emerald-400 border-emerald-500/30':'bg-red-500/15 text-red-400 border-red-500/30'}`}>
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
      </div>
    </Layout>
  )
}
