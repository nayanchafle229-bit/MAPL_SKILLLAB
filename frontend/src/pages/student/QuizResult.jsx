import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../api/axios'
import Layout from '../../components/Layout'
import { PageLoader, ScoreRing, PassBadge, DifficultyBadge, RankBadge } from '../../components/UI'

function fmtTime(s) {
  const m = Math.floor(s/60); const sec = s%60
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
}

export default function QuizResult() {
  const { id }   = useParams()
  const [result, setResult] = useState(null)
  const [loading,setLoading]= useState(true)
  const [tab, setTab]       = useState('overview') // overview | answers

  useEffect(() => {
    api.get(`/quiz/result/${id}`)
      .then(({ data }) => setResult(data.result))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Layout title="Result"><PageLoader /></Layout>
  if (!result)  return <Layout title="Result"><p className="text-slate-400 text-center py-12">Result not found.</p></Layout>

  const pct  = result.percentage
  const pass = result.passStatus === 'PASS'
  const quiz = result.quizId

  const grade = pct>=90?{l:'Outstanding 🏆',c:'from-emerald-500 to-green-600'}
              : pct>=75?{l:'Excellent 🌟',  c:'from-primary-500 to-primary-600'}
              : pct>=60?{l:'Good Job 👍',   c:'from-yellow-500 to-orange-500'}
              : pct>=50?{l:'Average 📚',    c:'from-orange-400 to-red-500'}
              :         {l:'Try Again 💪',  c:'from-red-500 to-rose-600'}

  const diffData = result.diffBreakdown || {}
  const diffLevels = [
    { k:'easy',   label:'Easy',   color:'bg-accent-500', light:'bg-accent-500/10 border-accent-500/30' },
    { k:'medium', label:'Medium', color:'bg-amber-500',   light:'bg-amber-500/10 border-amber-500/20' },
    { k:'hard',   label:'Hard',   color:'bg-red-500',     light:'bg-red-500/10 border-red-500/20' },
  ]

  return (
    <Layout title="Quiz Result">
      <div className="max-w-3xl mx-auto space-y-5">

        {/* Hero */}
        <div className={`bg-gradient-to-br ${grade.c} rounded-3xl p-6 text-white`}>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <ScoreRing score={result.score} total={result.totalMarks} size={160} />
            <div className="text-center sm:text-left flex-1">
              <p className="text-2xl font-black mb-1">{grade.l}</p>
              <p className="text-white/80 text-sm mb-3">{quiz?.title}</p>
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start mb-4">
                <PassBadge status={result.passStatus} />
                {result.rank && (
                  <span className="bg-white/20 text-white text-xs font-black px-3 py-1 rounded-full border border-white/30">
                    🏅 Rank #{result.rank}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[['✅',result.correctAnswers,'Correct'],['❌',result.wrongAnswers,'Wrong'],['⬜',result.unattempted,'Skipped']].map(([ic,v,l])=>(
                  <div key={l} className="bg-white/20 rounded-xl p-2.5 text-center backdrop-blur-sm">
                    <p className="text-lg font-black">{v}</p>
                    <p className="text-xs text-white/80">{l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            ['🎯','Score',`${result.score}/${result.totalMarks}`],
            ['📊','Percentage',`${pct.toFixed(1)}%`],
            ['⏱️','Time Taken', fmtTime(result.timeTaken||0)],
            ['🎖️','Pass Mark',`${quiz?.passMarks} (${quiz?.passPercentage}%)`],
          ].map(([ic,l,v])=>(
            <div key={l} className="bg-surface-card rounded-2xl border border-white/10 shadow-sm p-4 text-center">
              <span className="text-2xl">{ic}</span>
              <p className="text-lg font-black text-white mt-1">{v}</p>
              <p className="text-xs text-slate-400 font-medium">{l}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-surface-card rounded-2xl border border-white/10 shadow-sm overflow-hidden">
          <div className="flex border-b border-white/10">
            {[['overview','📊 Overview'],['answers','📋 Answer Review']].map(([t,l])=>(
              <button key={t} onClick={()=>setTab(t)}
                className={`flex-1 py-4 text-sm font-bold transition-all ${tab===t?'text-primary-400 border-b-2 border-primary-500 bg-primary-500/10':'text-slate-400 hover:text-slate-300 hover:bg-white/5'}`}>
                {l}
              </button>
            ))}
          </div>

          <div className="p-5">
            {/* Overview Tab */}
            {tab === 'overview' && (
              <div className="space-y-5">
                {/* Difficulty breakdown */}
                <div>
                  <h3 className="text-sm font-black text-slate-300 uppercase tracking-wider mb-3">Difficulty-wise Analysis</h3>
                  <div className="space-y-3">
                    {diffLevels.map(({ k, label, color, light }) => {
                      const d = diffData[k] || { correct:0, total:0 }
                      const dpct = d.total > 0 ? Math.round((d.correct/d.total)*100) : 0
                      return (
                        <div key={k} className={`flex items-center gap-4 p-4 rounded-xl border ${light}`}>
                          <DifficultyBadge level={k} />
                          <div className="flex-1">
                            <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
                              <span>{d.correct}/{d.total} correct</span>
                              <span>{dpct}%</span>
                            </div>
                            <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                              <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{width:`${dpct}%`}}/>
                            </div>
                          </div>
                          <span className="text-lg font-black text-slate-100 w-12 text-right">{dpct}%</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Performance visual */}
                <div>
                  <h3 className="text-sm font-black text-slate-300 uppercase tracking-wider mb-3">Performance Breakdown</h3>
                  <div className="flex rounded-xl overflow-hidden h-8 bg-white/5">
                    {result.correctAnswers > 0 && (
                      <div className="bg-accent-500 flex items-center justify-center text-white text-xs font-black transition-all"
                        style={{width:`${(result.correctAnswers/(result.correctAnswers+result.wrongAnswers+(result.unattempted||0)))*100}%`}}
                        title={`Correct: ${result.correctAnswers}`}>
                        {result.correctAnswers>2 && result.correctAnswers}
                      </div>
                    )}
                    {result.wrongAnswers > 0 && (
                      <div className="bg-red-400 flex items-center justify-center text-white text-xs font-black"
                        style={{width:`${(result.wrongAnswers/(result.correctAnswers+result.wrongAnswers+(result.unattempted||0)))*100}%`}}
                        title={`Wrong: ${result.wrongAnswers}`}>
                        {result.wrongAnswers>2 && result.wrongAnswers}
                      </div>
                    )}
                    {(result.unattempted||0) > 0 && (
                      <div className="bg-white/10 flex items-center justify-center text-slate-500 text-xs font-bold flex-1"
                        title={`Skipped: ${result.unattempted}`}>
                        {result.unattempted>2 && result.unattempted}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-slate-400 justify-center">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-accent-500 rounded-sm"/>Correct ({result.correctAnswers})</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-400 rounded-sm"/>Wrong ({result.wrongAnswers})</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-white/20 rounded-sm"/>Skipped ({result.unattempted||0})</span>
                  </div>
                </div>
              </div>
            )}

            {/* Answer Review Tab */}
            {tab === 'answers' && (
              <div className="space-y-3">
                {(result.answers || []).map((a, i) => {
                  const qData = a.questionId
                  const opts  = ['A','B','C','D']
                  return (
                    <div key={i} className={`p-4 rounded-xl border-2 ${a.isCorrect ? 'border-accent-500/30 bg-accent-500/10' : a.selected ? 'border-red-500/20 bg-red-500/10' : 'border-white/10 bg-white/5'}`}>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="bg-white/5 border border-white/10 text-slate-400 text-xs font-black px-2.5 py-1 rounded-full">Q{i+1}</span>
                          {a.difficulty && <DifficultyBadge level={a.difficulty} />}
                          <span className="text-xs font-semibold text-slate-400">{a.marks||1} mark{(a.marks||1)>1?'s':''}</span>
                        </div>
                        <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-black text-white ${a.isCorrect?'bg-accent-500':a.selected?'bg-red-500':'bg-slate-500'}`}>
                          {a.isCorrect?'✓':a.selected?'✗':'–'}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-100 mb-3 leading-relaxed">
                        {qData?.question || 'Question data unavailable'}
                      </p>
                      {qData?.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-2">
                          {opts.map(opt => {
                            const isCorrect  = opt === a.correct
                            const isSelected = opt === a.selected
                            return (
                              <div key={opt} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
                                isCorrect  ? 'bg-accent-500 text-white' :
                                isSelected ? 'bg-red-400 text-white' :
                                'bg-white/5 border border-white/10 text-slate-400'}`}>
                                <span className="font-black w-4">{opt}.</span>
                                <span className="flex-1">{qData.options[opt]}</span>
                                {isCorrect  && <span className="ml-auto">✓</span>}
                                {isSelected && !isCorrect && <span className="ml-auto">✗</span>}
                              </div>
                            )
                          })}
                        </div>
                      )}
                      <div className="flex gap-4 text-xs mt-1">
                        <span className="text-slate-400">Your: <strong className={a.isCorrect?'text-accent-400':'text-red-400'}>{a.selected||'Not answered'}</strong></span>
                        {!a.isCorrect && <span className="text-slate-400">Correct: <strong className="text-accent-400">{a.correct}</strong></span>}
                        <span className={`ml-auto font-black ${a.marksAwarded>0?'text-accent-400':a.marksAwarded<0?'text-red-400':'text-slate-500'}`}>
                          {a.marksAwarded>0?'+':''}{a.marksAwarded} marks
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          <Link to="/quizzes"               className="flex-1 text-center bg-white/5 border border-white/10 text-slate-300 font-bold py-3.5 rounded-xl hover:bg-white/5 transition-all text-sm">← Back to Quizzes</Link>
          <Link to={`/leaderboard/${quiz?._id||result.quizId}`} className="flex-1 text-center bg-slate-800 text-white font-bold py-3.5 rounded-xl hover:bg-slate-700 transition-all text-sm">🏆 Leaderboard</Link>
          <Link to="/portfolio"             className="flex-1 text-center bg-primary-600 text-white font-bold py-3.5 rounded-xl hover:bg-primary-500 transition-all text-sm">📊 Portfolio</Link>
        </div>
      </div>
    </Layout>
  )
}
