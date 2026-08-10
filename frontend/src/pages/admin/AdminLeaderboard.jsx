import React, { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../api/axios'
import Layout from '../../components/Layout'
import { PageLoader, PassBadge, StatCard } from '../../components/UI'

function fmtTime(s) {
  const sec = s || 0
  const m   = Math.floor(sec / 60)
  return `${String(m).padStart(2,'0')}:${String(sec % 60).padStart(2,'0')}`
}

// ── Podium card for top 3 ──────────────────────────────────────────────────────
function PodiumCard({ entry, position, totalMarks }) {
  if (!entry) return <div className="flex-1" />

  const cfg = {
    1: { emoji: '🥇', bar: 'h-24', bg: 'bg-yellow-500/25 border-yellow-400/50', text: 'text-amber-300', label: '1st', ring: 'ring-2 ring-yellow-400/60' },
    2: { emoji: '🥈', bar: 'h-16', bg: 'bg-slate-500/25 border-slate-400/50',   text: 'text-slate-300',  label: '2nd', ring: 'ring-2 ring-slate-400/40' },
    3: { emoji: '🥉', bar: 'h-10', bg: 'bg-amber-700/25 border-amber-600/40',   text: 'text-amber-400',  label: '3rd', ring: 'ring-2 ring-amber-600/40' },
  }[position]

  return (
    <div className="flex-1 max-w-[160px] flex flex-col items-center">
      {/* Avatar */}
      <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-white font-black text-base mb-1.5 ${cfg.bg} ${cfg.ring}`}>
        {(entry.name || '?')[0].toUpperCase()}
      </div>
      <p className="text-xs font-black text-white text-center leading-tight truncate w-full px-1 mb-0.5">
        {entry.name}
      </p>
      <p className={`text-xs font-bold ${cfg.text} mb-2`}>
        {entry.score}/{totalMarks} pts
      </p>
      {/* Bar */}
      <div className={`w-full ${cfg.bar} rounded-t-xl border flex items-center justify-center font-black text-sm ${cfg.bg} ${cfg.text}`}>
        {cfg.emoji}
      </div>
      <div className={`w-full py-1.5 text-center text-xs font-black rounded-b-sm ${cfg.text}`}>
        {cfg.label}
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function AdminLeaderboard() {
  const { id }   = useParams()
  const [data,    setData]    = useState(null)
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('all')   // all | pass | fail
  const [sortBy,  setSortBy]  = useState('rank')   // rank | name | score | time | percentage
  const [sortDir, setSortDir] = useState('asc')

  useEffect(() => {
    Promise.all([
      api.get(`/admin/quiz/${id}/leaderboard`),
      api.get(`/admin/quiz/${id}/stats`),
    ]).then(([lbRes, stRes]) => {
      setData(lbRes.data)
      setStats(stRes.data.stats)
    }).finally(() => setLoading(false))
  }, [id])

  const filtered = useMemo(() => {
    if (!data) return []
    let rows = data.leaderboard.filter(e =>
      (filter === 'all' || (filter === 'pass' ? e.passStatus === 'PASS' : e.passStatus === 'FAIL')) &&
      (!search || e.name?.toLowerCase().includes(search.toLowerCase()) || e.email?.toLowerCase().includes(search.toLowerCase()))
    )
    rows = [...rows].sort((a, b) => {
      let av, bv
      switch (sortBy) {
        case 'name':       av = (a.name||'').toLowerCase(); bv = (b.name||'').toLowerCase(); break
        case 'score':      av = a.score      ?? 0;   bv = b.score      ?? 0;   break
        case 'percentage': av = a.percentage ?? 0;   bv = b.percentage ?? 0;   break
        case 'time':       av = a.timeTaken  ?? 0;   bv = b.timeTaken  ?? 0;   break
        default:           av = a.rank ?? 9999;      bv = b.rank ?? 9999;      break
      }
      if (av < bv) return sortDir === 'asc' ? -1 :  1
      if (av > bv) return sortDir === 'asc' ?  1 : -1
      return 0
    })
    return rows
  }, [data, filter, search, sortBy, sortDir])

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir(col === 'rank' || col === 'time' ? 'asc' : 'desc') }
  }
  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <span className="text-white/30 ml-1">↕</span>
    return <span className="text-amber-300 ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  if (loading) return <Layout title="Leaderboard"><PageLoader /></Layout>
  if (!data)   return <Layout title="Leaderboard"><p className="text-slate-400 p-6">Not found.</p></Layout>

  const { leaderboard = [], quiz } = data
  // Top 3 sorted by rank for podium (always show rank order 1→2→3)
  const top3 = [...leaderboard].sort((a, b) => a.rank - b.rank).slice(0, 3)
  // Podium order: 2nd | 1st | 3rd  (visual)
  const podiumOrder = [top3[1], top3[0], top3[2]]
  const podiumPos   = [2, 1, 3]

  return (
    <Layout title={`Leaderboard — ${quiz?.title || ''}`}>

      {/* Page header */}
      <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-white">🏆 {quiz?.title}</h2>
          <p className="text-slate-400 text-sm">
            Pass: <strong>{quiz?.passMarks}/{quiz?.totalMarks}</strong>
            &nbsp;·&nbsp; {leaderboard.length} submission{leaderboard.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/admin/quizzes" className="text-sm text-primary-400 font-bold hover:underline">
          ← All Quizzes
        </Link>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
          <StatCard icon="👥" label="Attempts"  value={stats.totalAttempts}     color="blue"   />
          <StatCard icon="✅" label="Passed"     value={stats.passed}            color="green"  />
          <StatCard icon="❌" label="Failed"      value={stats.failed}            color="red"    />
          <StatCard icon="📈" label="Avg Score"  value={`${stats.avgScore}%`}   color="purple" />
          <StatCard icon="🏆" label="Pass Rate"  value={`${stats.passRate}%`}   color="orange" />
        </div>
      )}

      {/* ── Podium — Top 3 ───────────────────────────────────────────────── */}
      {leaderboard.length >= 2 && (
        <div className="bg-gradient-to-br from-surface-card via-primary-900 to-primary-900 rounded-2xl p-6 mb-5">
          <p className="text-xs font-black text-white/50 uppercase tracking-widest text-center mb-5">
            🏅 Top Performers
          </p>
          <div className="flex items-end justify-center gap-3">
            {podiumOrder.map((entry, i) => (
              <PodiumCard
                key={podiumPos[i]}
                entry={entry}
                position={podiumPos[i]}
                totalMarks={quiz?.totalMarks}
              />
            ))}
          </div>
        </div>
      )}

      //  {/* ── Score distribution chart ─────────────────────────────────────── */}
      {stats && leaderboard.length > 0 && (
        <div className="bg-surface-card rounded-2xl border border-white/10 shadow-sm p-5 mb-5">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
            Score Distribution
          </h3>
          <div className="flex items-end gap-1 h-20">
            {[0,10,20,30,40,50,60,70,80,90].map(bucket => {
              const count  = leaderboard.filter(e => e.percentage >= bucket && e.percentage < bucket + 10).length
              const maxCnt = Math.max(1, ...([0,10,20,30,40,50,60,70,80,90].map(b =>
                leaderboard.filter(e => e.percentage >= b && e.percentage < b + 10).length
              )))
              const h     = Math.max(count > 0 ? 8 : 0, (count / maxCnt) * 100)
              const color = bucket >= 80 ? 'bg-accent-500' : bucket >= 60 ? 'bg-primary-500' : bucket >= 40 ? 'bg-amber-500' : 'bg-red-400'
              return (
                <div key={bucket} className="flex-1 flex flex-col items-center gap-1" title={`${bucket}–${bucket+10}%: ${count}`}>
                  {count > 0 && <span className="text-xs font-bold text-slate-400">{count}</span>}
                  <div className={`w-full ${color} rounded-t-md`} style={{ height: `${h}%` }} />
                  <span className="text-xs text-slate-500 font-medium">{bucket}</span>
                </div>
              )
            })}
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-1 px-0.5">
            <span>0%</span><span className="text-slate-600">Score percentage →</span><span>100%</span>
          </div>
        </div>
      )}

      {/* ── Table with filters + sort ─────────────────────────────────────── */}
      <div className="glass-panel overflow-hidden p-0 rounded-2xl">

        {/* Filter bar */}
        <div className="p-4 border-b border-white/10 flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="🔍 Search students…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field max-w-xs text-sm"
          />
          <div className="flex rounded-xl border border-white/10 overflow-hidden">
            {[['all','All'],['pass','Pass'],['fail','Fail']].map(([v, l]) => (
              <button
                key={v}
                onClick={() => setFilter(v)}
                className={`px-4 py-2.5 text-sm font-bold transition-colors ${
                  filter === v ? 'bg-primary-600 text-white' : 'text-slate-400 hover:bg-white/5'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Sort controls */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-400 whitespace-nowrap">Sort:</label>
            <select
              value={sortBy}
              onChange={e => { setSortBy(e.target.value); setSortDir('asc') }}
              className="input-field text-sm !px-3 !py-2.5 !rounded-xl"
            >
              <option value="rank">Rank</option>
              <option value="name">Name</option>
              <option value="score">Score</option>
              <option value="percentage">Percentage</option>
              <option value="time">Time Taken</option>
            </select>
            <button
              onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
              className="input-field text-sm !px-3 !py-2.5 !rounded-xl font-bold text-slate-400 hover:text-white"
              title="Toggle sort direction"
            >
              {sortDir === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          <span className="text-xs text-slate-500 ml-auto">
            {filtered.length} student{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-3xl opacity-50 mb-2 block">📋</span>
            <p className="text-slate-400 text-sm font-bold">
              {leaderboard.length === 0 ? 'No submissions yet.' : 'No results match your filter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  {[
                    ['Rank',       'rank'],
                    ['Student',    'name'],
                    ['Score',      'score'],
                    ['%',          'percentage'],
                    ['Status',     null],
                    ['Correct',    null],
                    ['Wrong',      null],
                    ['Time',       'time'],
                    ['Submitted',  null],
                  ].map(([label, col]) => (
                    <th
                      key={label}
                      onClick={col ? () => handleSort(col) : undefined}
                      className={`text-left text-xs font-black text-slate-400 uppercase tracking-widest px-6 py-4 whitespace-nowrap ${
                        col ? 'cursor-pointer hover:text-primary-400 select-none' : ''
                      }`}
                    >
                      {label}{col && <SortIcon col={col} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((e, i) => {
                  const rankEmoji = e.rank === 1 ? '🥇' : e.rank === 2 ? '🥈' : e.rank === 3 ? '🥉' : null
                  return (
                    <tr key={i} className="hover:bg-white/[0.05] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {rankEmoji
                            ? <span className="text-2xl leading-none drop-shadow-sm group-hover:scale-110 transition-transform">{rankEmoji}</span>
                            : <span className="w-8 h-8 rounded-full bg-white/5 text-slate-400 text-xs font-black flex items-center justify-center border border-white/10 shadow-inner group-hover:border-primary-500/30 group-hover:text-primary-400 transition-colors">
                                #{e.rank}
                              </span>
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-500/20 to-primary-600/20 border border-primary-500/30 rounded-xl flex items-center justify-center text-primary-300 font-black text-sm flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                            {(e.name || '?')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm group-hover:text-primary-300 transition-colors">{e.name}</p>
                            <p className="text-[10px] font-medium text-slate-400 mt-0.5">{e.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-black text-white">{e.score}<span className="text-slate-500 text-xs">/{quiz?.totalMarks}</span></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1.5 bg-white/10 rounded-full overflow-hidden shadow-inner">
                            <div
                              className={`h-full rounded-full ${e.percentage >= 75 ? 'bg-emerald-500' : e.percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${e.percentage}%` }}
                            />
                          </div>
                          <span className="font-black text-xs text-slate-300">{e.percentage?.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4"><PassBadge status={e.passStatus} /></td>
                      <td className="px-6 py-4 text-emerald-400 font-black drop-shadow-sm">{e.correctAnswers ?? '—'}</td>
                      <td className="px-6 py-4 text-red-400 font-black drop-shadow-sm">{e.wrongAnswers ?? '—'}</td>
                      <td className="px-6 py-4 font-mono text-slate-400 text-xs font-medium">{fmtTime(e.timeTaken)}</td>
                      <td className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400 whitespace-nowrap">
                        {new Date(e.submittedAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}
