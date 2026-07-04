import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import Layout from '../../components/Layout'
import { PageLoader, PassBadge, RankBadge } from '../../components/UI'

function fmtTime(s) { const m=Math.floor(s/60); return `${String(m).padStart(2,'0')}:${String(s%60).padStart(2,'0')}` }

export default function Leaderboard() {
  const { id }   = useParams()
  const { user } = useAuth()
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('all') // all|pass|fail
  const [sort,    setSort]    = useState('rank') // rank|score|time|name

  useEffect(() => {
    api.get(`/admin/quiz/${id}/leaderboard`)
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Layout title="Leaderboard"><PageLoader /></Layout>
  if (!data)   return <Layout title="Leaderboard"><p className="text-gray-500 text-center py-12">Leaderboard not found.</p></Layout>

  const { leaderboard = [], quiz } = data
  const myEntry = leaderboard.find(e => e.userId?.toString() === user?._id?.toString())

  let filtered = leaderboard
    .filter(e => filter === 'all' || (filter==='pass'?e.passStatus==='PASS':e.passStatus==='FAIL'))
    .filter(e => !search || e.name?.toLowerCase().includes(search.toLowerCase()) || e.email?.toLowerCase().includes(search.toLowerCase()))

  filtered = [...filtered].sort((a,b) => {
    if (sort==='rank')  return a.rank - b.rank
    if (sort==='score') return b.score - a.score
    if (sort==='time')  return a.timeTaken - b.timeTaken
    if (sort==='name')  return (a.name||'').localeCompare(b.name||'')
    return 0
  })

  const top3 = leaderboard.slice(0,3)
  const passed = leaderboard.filter(e=>e.passStatus==='PASS').length
  const avgPct = leaderboard.length ? (leaderboard.reduce((s,e)=>s+e.percentage,0)/leaderboard.length).toFixed(1) : 0

  return (
    <Layout title="Leaderboard">
      {/* Hero banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 mb-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Leaderboard</p>
            <h2 className="text-2xl font-black">{quiz?.title || 'Quiz'}</h2>
            <div className="flex gap-4 mt-2 text-sm text-slate-300">
              <span>Pass: <strong className="text-white">{quiz?.passMarks}/{quiz?.totalMarks}</strong></span>
              <span>Attempts: <strong className="text-white">{leaderboard.length}</strong></span>
              <span>Pass rate: <strong className="text-emerald-400">{leaderboard.length?((passed/leaderboard.length)*100).toFixed(0):0}%</strong></span>
            </div>
          </div>
          {myEntry && (
            <div className="bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-center backdrop-blur-sm">
              <p className="text-xs text-slate-400 mb-1">Your Position</p>
              <p className="text-3xl font-black">#{myEntry.rank}</p>
              <p className="text-sm text-slate-300">{myEntry.score}/{quiz?.totalMarks} · {myEntry.percentage?.toFixed(1)}%</p>
            </div>
          )}
        </div>

        {/* Top 3 podium */}
        {top3.length >= 2 && (
          <div className="flex items-end justify-center gap-3 mt-4">
            {/* 2nd place */}
            {top3[1] && (
              <div className="text-center flex-1 max-w-[140px]">
                <div className="w-12 h-12 bg-slate-500/30 border-2 border-slate-400/50 rounded-full flex items-center justify-center text-xl mx-auto mb-2">🥈</div>
                <p className="text-xs font-black text-white truncate">{top3[1].name}</p>
                <p className="text-xs text-slate-400">{top3[1].score} pts</p>
                <div className="bg-slate-600/50 rounded-t-xl mt-2 h-16 flex items-center justify-center text-slate-300 font-black text-sm">2nd</div>
              </div>
            )}
            {/* 1st place */}
            {top3[0] && (
              <div className="text-center flex-1 max-w-[160px]">
                <div className="w-14 h-14 bg-yellow-500/30 border-2 border-yellow-400/60 rounded-full flex items-center justify-center text-2xl mx-auto mb-2 shadow-lg shadow-yellow-500/20">🥇</div>
                <p className="text-sm font-black text-white truncate">{top3[0].name}</p>
                <p className="text-xs text-yellow-300">{top3[0].score} pts</p>
                <div className="bg-yellow-600/30 border border-yellow-500/30 rounded-t-xl mt-2 h-24 flex items-center justify-center text-yellow-300 font-black">1st</div>
              </div>
            )}
            {/* 3rd place */}
            {top3[2] && (
              <div className="text-center flex-1 max-w-[140px]">
                <div className="w-12 h-12 bg-amber-700/30 border-2 border-amber-600/50 rounded-full flex items-center justify-center text-xl mx-auto mb-2">🥉</div>
                <p className="text-xs font-black text-white truncate">{top3[2].name}</p>
                <p className="text-xs text-slate-400">{top3[2].score} pts</p>
                <div className="bg-amber-800/40 rounded-t-xl mt-2 h-10 flex items-center justify-center text-amber-400 font-black text-sm">3rd</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[['👥',leaderboard.length,'Total Attempts'],['✅',passed,'Passed'],['📈',`${avgPct}%`,'Avg Score'],['🏆',top3[0]?.score||'—','Top Score']].map(([ic,v,l])=>(
          <div key={l} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <span className="text-2xl">{ic}</span>
            <p className="text-xl font-black text-gray-900 mt-1">{v}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{l}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center">
          <input type="text" placeholder="🔍 Search students..." value={search} onChange={e=>setSearch(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-0 max-w-xs"/>
          <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
            {[['all','All'],['pass','Pass'],['fail','Fail']].map(([v,l])=>(
              <button key={v} onClick={()=>setFilter(v)}
                className={`px-4 py-2 text-xs font-bold transition-colors ${filter===v?'bg-blue-600 text-white':'text-gray-600 hover:bg-gray-100'}`}>{l}</button>
            ))}
          </div>
          <select value={sort} onChange={e=>setSort(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="rank">Sort: Rank</option>
            <option value="score">Sort: Score</option>
            <option value="time">Sort: Time</option>
            <option value="name">Sort: Name</option>
          </select>
          <span className="text-xs text-gray-400 ml-auto">{filtered.length} students</span>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No results match your filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Rank','Student','Score','Percentage','Status','Time Taken','Date'].map(h=>(
                    <th key={h} className="text-left text-xs font-black text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((e, i) => {
                  const isMe = e.userId?.toString() === user?._id?.toString()
                  return (
                    <tr key={i} className={`transition-colors ${isMe?'bg-blue-50/70 border-l-4 border-blue-500':'hover:bg-gray-50/80'}`}>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center w-8">
                          <RankBadge rank={e.rank} />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                            {(e.name||'?')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{e.name}{isMe&&<span className="ml-1.5 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-black">You</span>}</p>
                            <p className="text-xs text-gray-400">{e.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-black text-gray-900">{e.score}/{quiz?.totalMarks||e.totalMarks}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${e.percentage>=75?'bg-emerald-500':e.percentage>=50?'bg-amber-500':'bg-red-500'}`}
                              style={{width:`${e.percentage}%`}}/>
                          </div>
                          <span className="font-bold text-sm text-gray-800">{e.percentage?.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-4"><PassBadge status={e.passStatus}/></td>
                      <td className="px-4 py-4 font-mono text-sm text-gray-600">{fmtTime(e.timeTaken||0)}</td>
                      <td className="px-4 py-4 text-xs text-gray-400">{new Date(e.submittedAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4">
        <Link to="/quizzes" className="text-sm text-blue-600 hover:underline font-semibold">← Back to Quizzes</Link>
      </div>
    </Layout>
  )
}
