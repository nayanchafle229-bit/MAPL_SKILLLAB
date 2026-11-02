import React, { useEffect, useState } from 'react'
import { Lock, PlayCircle, CheckCircle2, Trophy, BookOpen, Award, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import api from '../../api/axios'
import { PageLoader, Alert, EmptyState } from '../../components/UI'
import { LEVELS } from '../../utils/levels'

const STATUS_STYLE = {
  locked:   { icon: <Lock size={16} />, classes: 'bg-white/[0.02] border-white/5 text-slate-400 cursor-not-allowed',
              ring: '' },
  unlocked: { icon: <PlayCircle size={16} />, classes: 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 hover:border-primary-500/40 cursor-pointer',
              ring: '' },
  passed:   { icon: <CheckCircle2 size={16} />, classes: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/15 cursor-pointer',
              ring: 'ring-1 ring-emerald-500/20' },
}

function ModuleCell({ mod, onOpen }) {
  const style = STATUS_STYLE[mod.status] || STATUS_STYLE.locked
  const level = LEVELS.find((l) => l.value === mod.level)
  const clickable = mod.status !== 'locked'

  return (
    <button
      disabled={!clickable}
      onClick={() => clickable && onOpen(mod)}
      className={`w-full h-full min-h-[96px] rounded-xl border p-3 flex flex-col justify-between text-left transition-all ${style.classes} ${style.ring}`}
      title={mod.status === 'locked' ? 'Locked — pass the previous level quiz first' : mod.title}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-white">{level?.icon} {level?.label}</span>
        <span className="text-base leading-none">{style.icon}</span>
      </div>
      <div>
        {mod.videoCount === 0 && mod.status !== 'locked' ? (
          <p className="text-xs italic opacity-60 mt-2">Content coming soon</p>
        ) : (
          <div className="mt-2 space-y-0.5">
            <p className="text-xs opacity-70">
              {mod.completedVideosCount !== undefined && mod.status === 'unlocked'
                ? `${mod.completedVideosCount}/${mod.videoCount} videos`
                : `${mod.videoCount} video${mod.videoCount !== 1 ? 's' : ''}`}
              {mod.hasQuiz ? ' · Quiz' : ''}
            </p>
            {mod.status === 'unlocked' && mod.isQuizUnlocked && (
              <p className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                <span>Quiz ready</span>
              </p>
            )}
          </div>
        )}
        {mod.status === 'passed' && mod.bestScorePercent != null && (
          <p className="text-xs font-bold text-emerald-400 mt-1">Passed: {mod.bestScorePercent}%</p>
        )}
      </div>
    </button>
  )
}

function CategoryRow({ category, onOpen }) {
  const modulesByLevel = new Map(category.modules.map((m) => [m.level, m]))
  const passedCount = category.modules.filter((m) => m.status === 'passed').length
  const isCompleted = category.isCompleted || (passedCount === category.modules.length && category.modules.length > 0)

  return (
    <div className={`card transition-all ${isCompleted ? 'border-emerald-500/40 bg-emerald-950/10' : ''}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-white uppercase tracking-wide">Category {category.catNumber}</p>
            {isCompleted && (
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Check size={10} /> Category Completed
              </span>
            )}
          </div>
          <h3 className="text-base font-black text-white leading-snug mt-0.5">{category.name}</h3>
        </div>
        <span className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full border ${isCompleted ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-white/5 border-white/10 text-slate-300'}`}>
          {passedCount}/4 Levels
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {LEVELS.map((l) => {
          const mod = modulesByLevel.get(l.value)
          return mod
            ? <ModuleCell key={l.value} mod={mod} onOpen={onOpen} />
            : <div key={l.value} className="min-h-[96px] rounded-xl border border-dashed border-white/5" />
        })}
      </div>
    </div>
  )
}

export default function Curriculum() {
  const navigate = useNavigate()
  const [curriculum, setCurriculum] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/curriculum')
      .then(({ data }) => {
        setCurriculum(data.curriculum)
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load curriculum'))
  }, [])

  const handleOpen = (mod) => navigate(`/curriculum/${mod.moduleKey}`)

  return (
    <Layout title="Curriculum">
      <div className="max-w-5xl mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-black text-white">Curriculum Progression</h1>
          <p className="text-sm text-slate-400 mt-1">
            Each category progresses independently. Complete all videos in a level to unlock its assessment quiz. Pass the quiz to unlock the next level.
          </p>
        </div>

        {error && <Alert type="error" message={error} />}

        {!curriculum && !error && <PageLoader text="Loading curriculum..." />}

        {curriculum && curriculum.length === 0 && (
          <EmptyState icon={<BookOpen size={48} />} title="Nothing here yet" description="Content hasn't been published for this curriculum." />
        )}

        {curriculum && curriculum.map((cat) => (
          <CategoryRow key={cat._id} category={cat} onOpen={handleOpen} />
        ))}
      </div>
    </Layout>
  )
}
