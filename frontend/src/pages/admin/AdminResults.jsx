import React, { useState, useEffect, useMemo } from 'react'
import { Trophy, Target, CheckCircle2, XCircle, TrendingUp, Search } from 'lucide-react'
import api from '../../api/axios'
import Layout from '../../components/Layout'
import { PageLoader, EmptyState, StatCard, PassBadge } from '../../components/UI'

function fmtTime(s) {
  const m = Math.floor((s || 0) / 60)
  return `${String(m).padStart(2,'0')}:${String((s||0)%60).padStart(2,'0')}`
}

export default function AdminResults() {
  const [results,    setResults]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [filter,     setFilter]     = useState('all')   // all | pass | fail
  const [quizFilter, setQuizFilter] = useState('')
  const [sortBy,     setSortBy]     = useState('date')  // date | name | score | time | percentage
  const [sortDir,    setSortDir]    = useState('desc')  // asc | desc

  useEffect(() => {
    api.get('/admin/results')
      .then(({ data }) => setResults(data.results || []))
      .finally(() => setLoading(false))
  }, [])

  const quizTitles = useMemo(
    () => [...new Set(results.map(r => r.quizId?.title).filter(Boolean))].sort(),
    [results]
  )

  const filtered = useMemo(() => {
    let rows = results.filter(r => {
      const name  = r.userId?.profile?.name || ''
      const email = r.userId?.email || ''
      const matchSearch = !search ||
        name.toLowerCase().includes(search.toLowerCase()) ||
        email.toLowerCase().includes(search.toLowerCase())
      const matchFilter = filter === 'all' ||
        (filter === 'pass' ? r.passStatus === 'PASS' : r.passStatus === 'FAIL')
      const matchQuiz = !quizFilter || r.quizId?.title === quizFilter
      return matchSearch && matchFilter && matchQuiz
    })

    // ── Sort ───────────────────────────────────────────────────────────────
    rows = [...rows].sort((a, b) => {
      let av, bv
      switch (sortBy) {
        case 'name':
          av = (a.userId?.profile?.name || a.userId?.email || '').toLowerCase()
          bv = (b.userId?.profile?.name || b.userId?.email || '').toLowerCase()
          break
        case 'score':
          av = a.score ?? 0;        bv = b.score ?? 0;        break
        case 'percentage':
          av = a.percentage ?? 0;   bv = b.percentage ?? 0;   break
        case 'time':
          av = a.timeTaken ?? 0;    bv = b.timeTaken ?? 0;    break
        case 'rank':
          av = a.rank ?? 9999;      bv = b.rank ?? 9999;      break
        default: // date
          av = new Date(a.createdAt); bv = new Date(b.createdAt); break
      }
      if (av < bv) return sortDir === 'asc' ? -1 :  1
      if (av > bv) return sortDir === 'asc' ?  1 : -1
      return 0
    })
    return rows
  }, [results, search, filter, quizFilter, sortBy, sortDir])

  const total  = results.length
  const passed = results.filter(r => r.passStatus === 'PASS').length
  const avgPct = total
    ? (results.reduce((s, r) => s + r.percentage, 0) / total).toFixed(1)
    : 0

  // Toggle sort: same column → flip direction; new column → default desc
  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortBy(col); setSortDir('desc') }
  }
  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <span className="text-slate-600 ml-1">↕</span>
    return <span className="text-primary-400 ml-1">{sortDir === 'desc' ? '↓' : '↑'}</span>
  }

  if (loading) return <Layout title="All Results"><PageLoader /></Layout>

  return (
    <Layout title="All Quiz Results">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-white flex items-center gap-2"><Trophy size={28} /> All Results</h2>
        <p className="text-slate-400 text-sm">{total} total submission{total !== 1 ? 's' : ''}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<Target size={24} />} label="Total Attempts" value={total}          color="blue"   />
        <StatCard icon={<CheckCircle2 size={24} />} label="Passed"          value={passed}         color="green"  />
        <StatCard icon={<XCircle size={24} />} label="Failed"           value={total - passed} color="red"    />
        <StatCard icon={<TrendingUp size={24} />} label="Avg Score"       value={`${avgPct}%`}  color="purple" />
      </div>

      <div className="bg-surface-card rounded-2xl border border-white/10 shadow-sm overflow-hidden">

        {/* ── Filter bar ───────────────────────────────────────────────── */}
        <div className="p-4 border-b border-white/10 flex flex-wrap gap-3 items-center">
          {/* Search */}
          <input
            type="text"
            placeholder="Search name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white/5 w-52"
          />

          {/* Quiz filter */}
          <select
            value={quizFilter}
            onChange={e => setQuizFilter(e.target.value)}
            className="border border-white/10 rounded-xl px-3 py-2.5 text-sm bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Quizzes</option>
            {quizTitles.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          {/* Pass / Fail toggle */}
          <div className="flex rounded-xl border border-white/10 overflow-hidden bg-white/5">
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

          {/* Sort dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-400 whitespace-nowrap">Sort:</label>
            <select
              value={sortBy}
              onChange={e => { setSortBy(e.target.value); setSortDir('desc') }}
              className="border border-white/10 rounded-xl px-3 py-2.5 text-sm bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="date">Date</option>
              <option value="name">Name</option>
              <option value="score">Score</option>
              <option value="percentage">Percentage</option>
              <option value="time">Time Taken</option>
              <option value="rank">Rank</option>
            </select>
            <button
              onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
              className="border border-white/10 rounded-xl px-3 py-2.5 text-sm bg-white/5 hover:bg-white/5 font-bold text-slate-400 transition-colors"
              title={sortDir === 'desc' ? 'Descending — click for Ascending' : 'Ascending — click for Descending'}
            >
              {sortDir === 'desc' ? '↓' : '↑'}
            </button>
          </div>

          <span className="text-xs text-slate-500 ml-auto">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* ── Table ────────────────────────────────────────────────────── */}
        {results.length === 0 ? (
          <EmptyState icon={<Trophy size={48} />} title="No results yet" description="Results will appear once students complete quizzes." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="text-left text-xs font-black text-slate-400 uppercase tracking-widest px-6 py-4">#</th>

                  {/* Clickable sort headers */}
                  {[
                    ['Student', 'name'],
                    ['Quiz',    null],
                    ['Score',   'score'],
                    ['%',       'percentage'],
                    ['Status',  null],
                    ['Rank',    'rank'],
                    ['Time',    'time'],
                    ['Date',    'date'],
                  ].map(([label, col]) => (
                    <th
                      key={label}
                      onClick={col ? () => handleSort(col) : undefined}
                      className={`text-left text-xs font-black text-slate-400 uppercase tracking-widest px-6 py-4 whitespace-nowrap ${
                        col ? 'cursor-pointer hover:text-primary-400 select-none' : ''
                      }`}
                    >
                      {label}
                      {col && <SortIcon col={col} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((r, i) => {
                  const pct = r.percentage
                  return (
                    <tr key={r._id} className="hover:bg-white/[0.05] transition-colors group">
                      <td className="px-6 py-4 text-xs text-slate-500 font-bold group-hover:text-primary-400 transition-colors">{i + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-500/20 to-primary-600/20 border border-primary-500/30 rounded-xl flex items-center justify-center text-primary-300 font-black text-sm flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                            {(r.userId?.profile?.name || r.userId?.email || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-white group-hover:text-primary-300 transition-colors">{r.userId?.profile?.name || 'Student'}</p>
                            <p className="text-[10px] font-medium text-slate-400 mt-0.5">{r.userId?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-300 text-sm max-w-[160px] truncate" title={r.quizId?.title}>
                          {r.quizId?.title || '—'}
                        </p>
                      </td>
                      <td className="px-6 py-4 font-black text-white">{r.score}<span className="text-slate-500 text-xs">/{r.totalMarks}</span></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden shadow-inner">
                            <div
                              className={`h-full rounded-full ${pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="font-black text-xs text-slate-300">{pct.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4"><PassBadge status={r.passStatus} /></td>
                      <td className="px-6 py-4 font-black text-primary-300 text-sm drop-shadow-sm">
                        {r.rank ? `#${r.rank}` : '—'}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-400 font-medium">{fmtTime(r.timeTaken)}</td>
                      <td className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400 whitespace-nowrap">
                        {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <span className="opacity-50 mb-2 flex justify-center"><Search size={36} /></span>
                <p className="text-slate-400 text-sm font-bold">No results match your filter.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
