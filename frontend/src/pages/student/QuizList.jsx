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

function fmtDuration(mins) {
  if (!mins) return '—'
  return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`
}

function DiffBar({ ratio }) {
  if (!ratio) return null
  return (
    <div className="space-y-1">
      <div className="flex rounded-md overflow-hidden h-2 bg-white/5">
        {ratio.easy   > 0 && <div className="bg-accent-400 transition-all" style={{ width: `${ratio.easy}%` }} title={`Easy ${ratio.easy}%`} />}
        {ratio.medium > 0 && <div className="bg-amber-400 transition-all"   style={{ width: `${ratio.medium}%` }} title={`Medium ${ratio.medium}%`} />}
        {ratio.hard   > 0 && <div className="bg-red-400 transition-all"     style={{ width: `${ratio.hard}%` }} title={`Hard ${ratio.hard}%`} />}
      </div>
      <div className="flex gap-3 text-xs text-slate-500 justify-center">
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-accent-400 rounded-full" />Easy {ratio.easy}%</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-400 rounded-full" />Med {ratio.medium}%</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-400 rounded-full" />Hard {ratio.hard}%</span>
      </div>
    </div>
  )
}

function QuizCard({ q }) {
  const navigate = useNavigate()
  const pct = q.myPct !== null && q.myPct !== undefined

  return (
    <div className="bg-surface-card rounded-2xl border border-white/10 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
      {/* Coloured top strip */}
      <div className="bg-gradient-to-br from-slate-800 to-surface-base p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="w-10 h-10 bg-primary-500/20 border border-primary-400/30 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
            🧠
          </div>
          {q.attempted
            ? <PassBadge status={q.myStatus} />
            : <span className="bg-emerald-500/20 text-accent-300 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-400/30">
                New
              </span>
          }
        </div>
        <h3 className="font-black text-white text-base leading-tight mb-1 break-words">{q.title}</h3>
        {q.description && (
          <p className="text-slate-400 text-xs line-clamp-2 leading-snug">{q.description}</p>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2">
          {[
            ['❓', q.totalQuestions, 'Questions'],
            ['🏆', q.totalMarks,     'Marks'],
            ['⏱️', fmtDuration(q.duration), 'Time'],
          ].map(([ic, v, l]) => (
            <div key={l} className="bg-white/5 rounded-xl p-2 text-center">
              <span className="text-base leading-none">{ic}</span>
              <p className="text-sm font-black text-white mt-0.5 leading-tight">{v}</p>
              <p className="text-xs text-slate-500 leading-tight">{l}</p>
            </div>
          ))}
        </div>

        {/* Pass info */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-0.5">
          <span>
            Pass: <strong className="text-slate-300">{q.passMarks}/{q.totalMarks}</strong>
            {q.passPercentage !== undefined && (
              <span className="text-slate-500"> ({q.passPercentage}%)</span>
            )}
          </span>
          {q.category && (
            <span className="bg-primary-500/10 text-primary-400 px-2 py-0.5 rounded-full font-semibold border border-primary-500/20">
              {q.category}
            </span>
          )}
        </div>

        {/* Difficulty bar */}
        <DiffBar ratio={q.difficultyRatio} />

        {/* Attempts badge */}
        {q.attemptsAllowed > 1 && (
          <p className="text-xs text-center text-slate-500 font-medium">
            🔄 {q.attemptsAllowed} attempt{q.attemptsAllowed > 1 ? 's' : ''} allowed
          </p>
        )}

        {/* CTA — pushed to bottom */}
        <div className="mt-auto pt-1">
          {q.attempted ? (
            <div className="space-y-2">
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Your Score</span>
                <span className="font-black text-white text-sm">
                  {q.myScore} / {q.totalMarks}
                  {pct && <span className="text-slate-500 font-normal"> ({q.myPct?.toFixed(1)}%)</span>}
                </span>
              </div>
              {q.myRank && (
                <p className="text-xs text-center text-indigo-600 font-bold">🏅 Your Rank: #{q.myRank}</p>
              )}
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to={`/leaderboard/${q._id}`}
                  className="text-center text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition-colors"
                >
                  🏆 Leaderboard
                </Link>
                {/* Allow reattempt if attemptsAllowed > 1 */}
                {(q.attemptsAllowed || 1) > 1 && (
                  <Link
                    to={`/quiz/${q._id}`}
                    className="text-center text-xs bg-primary-500/10 hover:bg-primary-500/20 text-primary-300 font-bold py-2.5 rounded-xl transition-colors border border-primary-500/20"
                  >
                    🔄 Retry
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <Link
              to={`/quiz/${q._id}`}
              className="block text-center bg-primary-600 hover:bg-primary-500 text-white font-black py-3 rounded-xl transition-all shadow-sm hover:shadow-md text-sm"
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
      return matchSearch && matchCat
    })
    return { filtered, cats }
  }, [quizzes, search, catFilter])

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
          {search || catFilter ? (
            <button
              onClick={() => { setSearch(''); setCatFilter('') }}
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
