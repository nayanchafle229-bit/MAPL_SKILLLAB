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
      {/* Welcome hero */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-accent-600 rounded-3xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32"/>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24"/>
        </div>
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black mb-1">Hey {p.name?.split(' ')[0] || 'Learner'}! 👋</h2>
            <p className="text-blue-100 text-sm">
              {p.branch && `${p.branch} · `}{p.year || 'Keep learning every day'}
            </p>
            {pending > 0 && (
              <p className="text-blue-200 text-xs mt-2 font-semibold">
                📌 {pending} quiz{pending>1?'zes':''} available to attempt
              </p>
            )}
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link to="/quizzes" className="bg-white text-primary-700 font-black px-5 py-3 rounded-xl hover:bg-primary-50 transition-all shadow-lg text-sm">
              🧠 Take Quiz
            </Link>
            <Link to="/portfolio" className="bg-white/20 border border-white/30 text-white font-bold px-5 py-3 rounded-xl hover:bg-white/30 transition-all text-sm backdrop-blur-sm">
              📊 Portfolio
            </Link>
          </div>
        </div>
        {p.interests && (
          <div className="relative mt-4 flex flex-wrap gap-2">
            {p.interests.split(',').map(i=>i.trim()).filter(Boolean).map(t=>(
              <span key={t} className="bg-white/15 text-white text-xs px-3 py-1 rounded-full border border-white/20">{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon="🎯" label="Quizzes Attempted" value={total}                           color="blue"   />
        <StatCard icon="✅" label="Passed"              value={passed}                          color="green"  />
        <StatCard icon="🏆" label="Best Score"          value={best ? `${best.toFixed(1)}%` : '—'} color="orange" />
        <StatCard icon="🏅" label="Best Rank"           value={bestRank ? `#${bestRank}` : '—'}    color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Quizzes */}
        <div className="bg-surface-card rounded-2xl border border-white/10 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <h3 className="font-black text-white text-sm">🧠 Available Quizzes</h3>
            <Link to="/quizzes" className="text-xs text-primary-400 hover:underline font-bold">View all →</Link>
          </div>
          {quizzes.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-slate-500 text-sm">No quizzes available yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {quizzes.map(q => (
                <div key={q._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/5 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                    {q.title[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm truncate">{q.title}</p>
                    <p className="text-xs text-slate-500">{q.totalQuestions}Q · {q.totalMarks}M · {q.duration}min</p>
                  </div>
                  <div className="flex-shrink-0">
                    {q.attempted ? (
                      <div className="text-right">
                        <PassBadge status={q.myStatus} />
                        <p className="text-xs text-slate-500 mt-0.5">{q.myPct?.toFixed(0)}%</p>
                      </div>
                    ) : (
                      <Link to={`/quiz/${q._id}`} className="text-xs bg-primary-600 hover:bg-primary-500 text-white font-black px-3 py-2 rounded-xl transition-colors">Start →</Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Results */}
        <div className="bg-surface-card rounded-2xl border border-white/10 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <h3 className="font-black text-white text-sm">📊 Recent Results</h3>
            <Link to="/history" className="text-xs text-primary-400 hover:underline font-bold">View all →</Link>
          </div>
          {results.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-3">🎯</div>
              <p className="text-slate-400 text-sm">No quiz attempts yet.</p>
              <Link to="/quizzes" className="mt-3 inline-block bg-primary-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl">Take your first quiz</Link>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {results.slice(0, 5).map(r => {
                const pct = r.percentage
                return (
                  <Link to={`/result/${r._id}`} key={r._id}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-white/5 transition-colors group">
                    <div className="min-w-0">
                      <p className="font-bold text-white text-sm truncate">{r.quizId?.title||'Quiz'}</p>
                      <p className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})} {r.rank&&`· Rank #${r.rank}`}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                      <div className="text-right">
                        <p className="font-black text-sm text-white">{r.score}/{r.totalMarks}</p>
                        <PassBadge status={r.passStatus} />
                      </div>
                      <span className={`text-sm font-black px-2.5 py-1.5 rounded-xl ${pct>=75?'bg-accent-500/15 text-accent-400':pct>=50?'bg-amber-500/15 text-amber-300':'bg-red-500/15 text-red-400'}`}>
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA row */}
      {total > 0 && (
        <div className="mt-6 bg-gradient-to-r from-slate-800 to-surface-base rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
          <div>
            <p className="font-black text-base">
              {best >= 75 ? '🌟 Great performance!' : best >= 50 ? '📚 Keep improving!' : '💪 You can do better!'}
            </p>
            <p className="text-slate-400 text-sm mt-0.5">
              {total} attempt{total>1?'s':''} · Avg {avg||0}% · Best {best?.toFixed(1)||0}%
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/quizzes"   className="text-sm bg-primary-600 hover:bg-primary-500 text-white font-bold px-5 py-2.5 rounded-xl transition-colors">🧠 New Quiz</Link>
            <Link to="/portfolio" className="text-sm bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-2.5 rounded-xl border border-white/20 transition-colors">📊 Portfolio</Link>
          </div>
        </div>
      )}
    </Layout>
  )
}
