/**
 * QuizList.jsx — Student quiz browser
 * Shows ONLY published quizzes (backend already filters status=published)
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import Layout from '../../components/Layout'
import { PageLoader, PassBadge } from '../../components/UI'
import {
  IconBrain, IconHelp, IconStar, IconClock, IconRefresh, IconMedal,
  IconTrophy, IconSearch, IconRocket, IconAlertTriangle,
} from '../../components/Icons'

function fmtDuration(mins) {
  if (!mins) return '—'
  return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`
}

function DiffBar({ ratio }) {
  if (!ratio) return null
  return (
    <div className="space-y-1">
      <div className="flex rounded-md overflow-hidden h-2 bg-gray-100">
        {ratio.easy   > 0 && <div className="bg-emerald-400 transition-all" style={{ width: `${ratio.easy}%` }} title={`Easy ${ratio.easy}%`} />}
        {ratio.medium > 0 && <div className="bg-amber-400 transition-all"   style={{ width: `${ratio.medium}%` }} title={`Medium ${ratio.medium}%`} />}
        {ratio.hard   > 0 && <div className="bg-rose-400 transition-all"    style={{ width: `${ratio.hard}%` }} title={`Hard ${ratio.hard}%`} />}
      </div>
      <div className="flex gap-3 text-xs text-gray-400 justify-center">
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-400 rounded-full" />Easy {ratio.easy}%</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-400 rounded-full" />Med {ratio.medium}%</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-rose-400 rounded-full" />Hard {ratio.hard}%</span>
      </div>
    </div>
  )
}

function QuizCard({ q }) {
  const pct = q.myPct !== null && q.myPct !== undefined

  return (
    <div className="quiz-card-hover bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      {/* Coloured top strip */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="w-10 h-10 bg-primary-500/20 border border-primary-400/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <IconBrain className="w-5 h-5 text-primary-300" />
          </div>
          {q.attempted
            ? <PassBadge status={q.myStatus} />
            : <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-400/30">
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
            [IconHelp, q.totalQuestions, 'Questions'],
            [IconStar, q.totalMarks, 'Marks'],
            [IconClock, fmtDuration(q.duration), 'Time'],
          ].map(([Ic, v, l]) => (
            <div key={l} className="bg-gray-50 rounded-xl p-2 text-center">
              <Ic className="w-4 h-4 text-gray-400 mx-auto" />
              <p className="text-sm font-black text-gray-900 mt-0.5 leading-tight">{v}</p>
              <p className="text-xs text-gray-400 leading-tight">{l}</p>
            </div>
          ))}
        </div>

        {/* Pass info */}
        <div className="flex items-center justify-between text-xs text-gray-500 px-0.5">
          <span>
            Pass: <strong className="text-gray-700">{q.passMarks}/{q.totalMarks}</strong>
            {q.passPercentage !== undefined && (
              <span className="text-gray-400"> ({q.passPercentage}%)</span>
            )}
          </span>
          {q.category && (
            <span className="bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full font-semibold border border-primary-100">
              {q.category}
            </span>
          )}
        </div>

        {/* Difficulty bar */}
        <DiffBar ratio={q.difficultyRatio} />

        {/* Attempts badge */}
        {q.attemptsAllowed > 1 && (
          <p className="flex items-center justify-center gap-1.5 text-xs text-center text-gray-400 font-medium">
            <IconRefresh className="w-3.5 h-3.5" /> {q.attemptsAllowed} attempts allowed
          </p>
        )}

        {/* CTA — pushed to bottom */}
        <div className="mt-auto pt-1">
          {q.attempted ? (
            <div className="space-y-2">
              <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">Your Score</span>
                <span className="font-black text-gray-900 text-sm">
                  {q.myScore} / {q.totalMarks}
                  {pct && <span className="text-gray-400 font-normal"> ({q.myPct?.toFixed(1)}%)</span>}
                </span>
              </div>
              {q.myRank && (
                <p className="flex items-center justify-center gap-1.5 text-xs text-center text-primary-600 font-bold">
                  <IconMedal className="w-3.5 h-3.5" /> Your Rank: #{q.myRank}
                </p>
              )}
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to={`/leaderboard/${q._id}`}
                  className="flex items-center justify-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition-colors"
                >
                  <IconTrophy className="w-3.5 h-3.5" /> Leaderboard
                </Link>
                {/* Allow reattempt if attemptsAllowed > 1 */}
                {(q.attemptsAllowed || 1) > 1 && (
                  <Link
                    to={`/quiz/${q._id}`}
                    className="flex items-center justify-center gap-1.5 text-xs bg-primary-50 hover:bg-primary-100 text-primary-700 font-bold py-2.5 rounded-xl transition-colors border border-primary-200"
                  >
                    <IconRefresh className="w-3.5 h-3.5" /> Retry
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <Link
              to={`/quiz/${q._id}`}
              className="flex items-center justify-center gap-2 text-center bg-primary-600 hover:bg-primary-700 text-white font-black py-3 rounded-xl transition-all shadow-sm hover:shadow-md text-sm"
            >
              <IconRocket className="w-4 h-4" /> Start Quiz
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
      // Dominant-difficulty filter: a quiz "is" whichever band makes up the largest share of its ratio.
      const matchDiff    = !diffFilter || (() => {
        const r = q.difficultyRatio
        if (!r) return false
        const dominant = Object.entries(r).sort((a, b) => b[1] - a[1])[0]?.[0]
        return dominant === diffFilter
      })()
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
          <h2 className="flex items-center gap-2 text-2xl font-black text-gray-900">
            <IconBrain className="w-6 h-6 text-primary-600" /> Quizzes
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {quizzes.length} published quiz{quizzes.length !== 1 ? 'zes' : ''} available
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <IconSearch className="w-4 h-4 text-gray-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white w-44"
            />
          </div>
          {cats.length > 1 && (
            <select
              value={catFilter}
              onChange={e => setCatFilter(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Topics</option>
              {cats.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
          <select
            value={diffFilter}
            onChange={e => setDiffFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Mostly Easy</option>
            <option value="medium">Mostly Medium</option>
            <option value="hard">Mostly Hard</option>
          </select>
          <button
            onClick={load}
            className="flex items-center justify-center border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-white hover:bg-gray-50 text-gray-600 font-semibold transition-colors"
            title="Refresh"
          >
            <IconRefresh className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-6 flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-5 py-4 text-sm font-semibold">
          <IconAlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Empty state */}
      {!error && filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-500 flex items-center justify-center mx-auto mb-4">
            <IconBrain className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            {quizzes.length === 0 ? 'No published quizzes yet' : 'No quizzes match your search'}
          </h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            {quizzes.length === 0
              ? "The admin hasn't published any quizzes yet. Check back soon!"
              : 'Try clearing the search or filters.'}
          </p>
          {search || catFilter || diffFilter ? (
            <button
              onClick={() => { setSearch(''); setCatFilter(''); setDiffFilter('') }}
              className="mt-5 text-sm text-primary-600 hover:underline font-semibold"
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
