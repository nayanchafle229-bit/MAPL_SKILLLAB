import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import api from '../../api/axios'
import { PageLoader, Alert, EmptyState } from '../../components/UI'
import { LEVELS } from '../../utils/levels'

// Status -> visual treatment for a grid cell. Kept as one lookup so adding a
// 5th status later (e.g. 'in_progress') is a one-line change here, not a
// hunt through JSX.
const STATUS_STYLE = {
  locked:   { icon: '🔒', classes: 'bg-white/[0.02] border-white/5 text-slate-400 cursor-not-allowed',
              ring: '' },
  unlocked: { icon: '▶️', classes: 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 hover:border-primary-500/40 cursor-pointer',
              ring: '' },
  passed:   { icon: '✅', classes: 'bg-accent-500/10 border-accent-500/30 text-accent-300 hover:bg-accent-500/15 cursor-pointer',
              ring: 'ring-1 ring-accent-500/20' },
}

function ModuleCell({ mod, onOpen }) {
  const style = STATUS_STYLE[mod.status] || STATUS_STYLE.locked
  const level = LEVELS.find((l) => l.value === mod.level)
  const clickable = mod.status !== 'locked'

  return (
    <button
      disabled={!clickable}
      onClick={() => clickable && onOpen(mod)}
      className={`w-full h-full min-h-[92px] rounded-xl border p-3 flex flex-col justify-between text-left transition-all ${style.classes} ${style.ring}`}
      title={mod.status === 'locked' ? 'Locked — pass the previous level first' : mod.title}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-white">{level?.icon} {level?.label}</span>
        <span className="text-base leading-none">{style.icon}</span>
      </div>
      <div>
        {mod.videoCount === 0 && mod.status !== 'locked' ? (
          <p className="text-xs italic opacity-60 mt-2">Content coming soon</p>
        ) : (
          <p className="text-xs opacity-70 mt-2">{mod.videoCount} video{mod.videoCount !== 1 ? 's' : ''}{mod.hasQuiz ? ' · Gate quiz' : ''}</p>
        )}
        {mod.status === 'passed' && mod.bestScorePercent != null && (
          <p className="text-xs font-bold mt-1">{mod.bestScorePercent}%</p>
        )}
      </div>
    </button>
  )
}

function CategoryRow({ category, onOpen }) {
  const modulesByLevel = new Map(category.modules.map((m) => [m.level, m]))
  const passedCount = category.modules.filter((m) => m.status === 'passed').length

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-white uppercase tracking-wide">Category {category.catNumber}</p>
          <h3 className="text-base font-black text-white leading-snug">{category.name}</h3>
        </div>
        <span className="flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
          {passedCount}/4
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {LEVELS.map((l) => {
          const mod = modulesByLevel.get(l.value)
          return mod
            ? <ModuleCell key={l.value} mod={mod} onOpen={onOpen} />
            : <div key={l.value} className="min-h-[92px] rounded-xl border border-dashed border-white/5" />
        })}
      </div>
    </div>
  )
}

export default function Curriculum() {
  const navigate = useNavigate()
  const [curriculum, setCurriculum] = useState(null)
  const [pendingQuiz, setPendingQuiz] = useState(null)
  const [pendingLevel, setPendingLevel] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/curriculum')
      .then(({ data }) => {
        setCurriculum(data.curriculum)
        setPendingQuiz(data.pendingLevelQuiz || null)
        setPendingLevel(data.pendingLevel || null)
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load curriculum'))
  }, [])

  const handleOpen = (mod) => navigate(`/curriculum/${mod.moduleKey}`)

  return (
    <Layout title="Curriculum">
      <div className="max-w-5xl mx-auto space-y-5">
        
        {pendingQuiz && pendingLevel && (
          <div className="mb-8 p-6 bg-primary-900/40 border border-primary-500/30 rounded-xl flex items-center justify-between gap-6 shadow-lg">
            <div>
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <span className="text-2xl">🏆</span> Level {LEVELS.find((l) => l.value === pendingLevel)?.label} Complete!
              </h3>
              <p className="text-slate-300">
                You have completed all courses in the {LEVELS.find((l) => l.value === pendingLevel)?.label} level. 
                Take the level quiz to unlock the next level.
              </p>
            </div>
            <button onClick={() => navigate(`/quizzes/${pendingQuiz._id}`)} className="btn-primary flex-shrink-0 whitespace-nowrap shadow-primary-600/20 shadow-lg px-8 py-3 rounded-xl font-bold text-lg hover:scale-105 transition-transform">
              Take Level Quiz
            </button>
          </div>
        )}

        <div>
          <h1 className="text-2xl font-black text-white">Curriculum</h1>
          <p className="text-sm text-slate-400 mt-1">Each row is a category, each column a level. Complete a level and its quiz to unlock the next.</p>
        </div>

        {error && <Alert type="error" message={error} />}

        {!curriculum && !error && <PageLoader text="Loading curriculum..." />}

        {curriculum && curriculum.length === 0 && (
          <EmptyState icon="📚" title="Nothing here yet" description="Content hasn't been published for this curriculum." />
        )}

        {curriculum && curriculum.map((cat) => (
          <CategoryRow key={cat._id} category={cat} onOpen={handleOpen} />
        ))}
      </div>
    </Layout>
  )
}
