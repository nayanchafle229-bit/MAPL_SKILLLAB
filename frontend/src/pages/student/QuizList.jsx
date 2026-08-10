/**
 * QuizList.jsx — Student quiz browser
 * Shows ONLY published quizzes (backend already filters status=published)
 * Fixes: empty-state messaging, error handling, attempt badges, refresh.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import Layout from '../../components/Layout'
import { PageLoader, PassBadge } from '../../components/UI'
import { LEVELS, LEVEL_MAP } from '../../utils/levels'

function fmtDuration(mins) {
  if (!mins) return '—'
  return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`
}

function QuizCard({ q }) {
  const navigate = useNavigate()
  const pct = q.myPct !== null && q.myPct !== undefined
  const lvl = LEVEL_MAP[q.level] || LEVEL_MAP['apprentice'] // Default fallback if missing

  if (q.locked) {
    return (
      <div className="glass-panel rounded-2xl overflow-hidden flex flex-col opacity-50 grayscale select-none relative group cursor-not-allowed">
        <div className="absolute inset-0 bg-black/40 z-10 flex flex-col items-center justify-center backdrop-blur-[2px]">
          <div className="w-14 h-14 bg-slate-800/80 rounded-full flex items-center justify-center mb-3 shadow-lg border border-slate-700/50">
            <span className="text-2xl">🔒</span>
          </div>
          <span className="font-black text-white tracking-widest uppercase text-sm drop-shadow-md">Locked</span>
          <p className="text-xs text-slate-300 mt-2 font-medium">Complete all {lvl.label} content first</p>
        </div>
        
        <div className="bg-gradient-to-br from-slate-900 to-surface-card p-6 relative z-0">
          <div className="flex items-start justify-between gap-2 mb-4">
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
              🔒
            </div>
          </div>
          <h3 className="font-black text-slate-300 text-lg leading-tight mb-2 break-words">{q.title}</h3>
          {q.description && (
            <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">{q.description}</p>
          )}
        </div>
        <div className="p-6 flex flex-col flex-1 gap-4 bg-surface-card/50 relative z-0">
          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3">
            {[
              ['❓', q.totalQuestions, 'Questions'],
              ['🏆', q.totalMarks,     'Marks'],
              ['⏱️', fmtDuration(q.duration), 'Time'],
            ].map(([ic, v, l]) => (
              <div key={l} className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                <span className="text-lg leading-none">{ic}</span>
                <p className="text-sm font-black text-slate-400 mt-1">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-panel group rounded-2xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col relative hover:border-white/20">
      {/* Decorative animated glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-primary-500/20 transition-all duration-500 z-0"></div>
      
      {/* Coloured top strip */}
      <div className="bg-gradient-to-br from-slate-800/80 to-surface-card/80 p-6 relative z-10 border-b border-white/5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-primary-400/30 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300">
            🧠
          </div>
          {q.attempted
            ? <PassBadge status={q.myStatus} />
            : <span className="bg-emerald-500/20 text-emerald-400 text-[10px] uppercase tracking-widest font-black px-3 py-1.5 rounded-full border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                New
              </span>
          }
        </div>
        <h3 className="font-black text-white text-xl leading-tight mb-2 break-words group-hover:text-primary-300 transition-colors">{q.title}</h3>
        {q.description && (
          <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed font-medium">{q.description}</p>
        )}
      </div>

      {/* Body */}
      <div className="p-6 flex flex-col flex-1 gap-5 relative z-10">
        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            ['❓', q.totalQuestions, 'Questions'],
            ['🏆', q.totalMarks,     'Marks'],
            ['⏱️', fmtDuration(q.duration), 'Time'],
          ].map(([ic, v, l]) => (
            <div key={l} className="bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-3 text-center border border-white/5 shadow-inner">
              <span className="text-xl leading-none drop-shadow-sm">{ic}</span>
              <p className="text-base font-black text-white mt-1.5 leading-tight">{v}</p>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mt-1">{l}</p>
            </div>
          ))}
        </div>

        {/* Pass info & Category */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Pass: <span className="text-slate-200">{q.passMarks}/{q.totalMarks}</span>
            {q.passPercentage !== undefined && (
              <span className="text-slate-500">({q.passPercentage}%)</span>
            )}
          </span>
          {q.category && (
            <span className="bg-white/10 text-slate-300 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest border border-white/10 shadow-inner">
              {q.category}
            </span>
          )}
        </div>

        {/* Level badge */}
        <div className="flex justify-center mt-1">
          <span className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-black shadow-lg border backdrop-blur-md ${lvl.badge}`}>
            {lvl.icon} {lvl.label}
          </span>
        </div>

        {/* Attempts badge */}
        {q.attemptsAllowed > 1 && (
          <p className="text-xs text-center text-primary-300/70 font-bold tracking-wide">
            <span className="inline-block w-2 h-2 rounded-full bg-primary-400/50 mr-1.5"></span>
            {q.attemptsAllowed} attempt{q.attemptsAllowed > 1 ? 's' : ''} allowed
          </p>
        )}

        {/* CTA */}
        <div className="mt-auto pt-4 border-t border-white/5">
          {q.attempted ? (
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-white/5 to-transparent border border-white/10 rounded-xl px-5 py-3 flex items-center justify-between shadow-inner">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Your Score</span>
                <span className="font-black text-white text-lg">
                  {q.myScore} <span className="text-sm text-slate-500 font-bold">/ {q.totalMarks}</span>
                  {pct && <span className="text-slate-400 text-sm ml-1">({q.myPct?.toFixed(1)}%)</span>}
                </span>
              </div>
              
              {q.myRank && (
                <div className="flex items-center justify-center gap-2 text-sm text-amber-400 font-black bg-amber-500/10 py-2 rounded-lg border border-amber-500/20">
                  <span>🏅</span> Rank #{q.myRank}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to={`/leaderboard/${q._id}`}
                  className="text-center text-xs bg-white text-primary-900 font-black py-3 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  🏆 Leaderboard
                </Link>
                {/* Allow reattempt if attemptsAllowed > 1 */}
                {(q.attemptsAllowed || 1) > 1 && (
                  <Link
                    to={`/quiz/${q._id}`}
                    className="text-center text-xs bg-primary-500/20 hover:bg-primary-500/30 text-primary-300 font-black py-3 rounded-xl transition-all border border-primary-500/30 hover:-translate-y-0.5"
                  >
                    🔄 Retry Quiz
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <Link
              to={`/quiz/${q._id}`}
              className="block text-center bg-primary-600 hover:bg-primary-500 text-white font-black py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:-translate-y-0.5 text-sm uppercase tracking-wider"
            >
              🚀 Start Quiz
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [search,  setSearch]  = useState('')
  const [catFilter,  setCatFilter]  = useState('')
  const [diffFilter, setDiffFilter] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    api.get('/quiz')
      .then(({ data }) => setQuizzes(data.quizzes || []))
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to load quizzes. Is the backend running on port 3001?')
        setQuizzes([])
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const { filtered, cats } = useMemo(() => {
    const cats = [...new Set(quizzes.map(q => q.category).filter(Boolean))].sort()
    const filtered = quizzes.filter(q => {
      const matchSearch = !search || q.title.toLowerCase().includes(search.toLowerCase()) || q.category?.toLowerCase().includes(search.toLowerCase())
      const matchCat    = !catFilter  || q.category === catFilter
      const matchDiff   = !diffFilter || q.level === diffFilter
      return matchSearch && matchCat && matchDiff
    })
    return { filtered, cats }
  }, [quizzes, search, catFilter, diffFilter])

  if (loading) return <Layout title="Quizzes"><PageLoader text="Loading quizzes…" /></Layout>

  return (
    <Layout title="Available Quizzes">

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">🧠 Quizzes</h2>
          <p className="text-slate-400 text-sm mt-1">
            {quizzes.length} published quiz{quizzes.length !== 1 ? 'zes' : ''} available
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="🔍 Search…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white/5 w-44"
          />
          {cats.length > 1 && (
            <select
              value={catFilter}
              onChange={e => setCatFilter(e.target.value)}
              className="border border-white/10 rounded-xl px-3 py-2.5 text-sm bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Topics</option>
              {cats.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
          <select
            value={diffFilter}
            onChange={e => setDiffFilter(e.target.value)}
            className="border border-white/10 rounded-xl px-3 py-2.5 text-sm bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Levels</option>
            {LEVELS.map(l => <option key={l.value} value={l.value}>{l.icon} {l.label}</option>)}
          </select>
          <button
            onClick={load}
            className="border border-white/10 rounded-xl px-4 py-2.5 text-sm bg-white/5 hover:bg-white/5 text-slate-400 font-semibold transition-colors"
            title="Refresh"
          >
            ↻
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-300 rounded-2xl px-5 py-4 text-sm font-semibold">
          ❌ {error}
        </div>
      )}

      {/* Empty state */}
      {!error && filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🧠</div>
          <h3 className="text-xl font-bold text-slate-300 mb-2">
            {quizzes.length === 0 ? 'No published quizzes yet' : 'No quizzes match your search'}
          </h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            {quizzes.length === 0
              ? 'The admin hasn\'t published any quizzes yet. Check back soon!'
              : 'Try clearing the search or category filter.'}
          </p>
          {search || catFilter || diffFilter ? (
            <button
              onClick={() => { setSearch(''); setCatFilter(''); setDiffFilter('') }}
              className="mt-5 text-sm text-primary-400 hover:underline font-semibold"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      )}

      {/* Quiz grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(q => <QuizCard key={q._id} q={q} />)}
        </div>
      )}
    </Layout>
  )
}
