import React, { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import Markdown from '../../components/Markdown'
import api from '../../api/axios'
import { PageLoader, Alert } from '../../components/UI'
import { getLevel } from '../../utils/levels'
import { CheckCircle2, Lock, PlayCircle, Trophy, Sparkles } from 'lucide-react'

function toEmbedUrl(url) {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtu.be')) return `https://www.youtube.com/embed/${u.pathname.slice(1)}`
    if (u.searchParams.get('v')) return `https://www.youtube.com/embed/${u.searchParams.get('v')}`
    return url
  } catch {
    return url
  }
}

function getYouTubeId(url) {
  if (!url) return null
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

export default function ModuleDetail() {
  const { moduleKey } = useParams()
  const navigate = useNavigate()
  const [mod, setMod] = useState(null)
  const [activeVideo, setActiveVideo] = useState(0)
  const [error, setError] = useState('')
  const [marking, setMarking] = useState(false)
  const [markedVideos, setMarkedVideos] = useState({})

  const isVideoWatched = (v) => {
    if (!v || !v.url) return false
    const yId = getYouTubeId(v.url)
    return Boolean(markedVideos[v.url] || (yId && markedVideos[yId]))
  }

  const handleMarkComplete = async (video) => {
    if (!video || !video.url) return
    setMarking(true)
    try {
      await api.post(`/curriculum/modules/${moduleKey}/video-complete`, { url: video.url })
      const yId = getYouTubeId(video.url)
      setMarkedVideos(prev => ({
        ...prev,
        [video.url]: true,
        ...(yId ? { [yId]: true } : {})
      }))
      // Refresh module details to update backend verified state
      const { data } = await api.get(`/curriculum/modules/${moduleKey}`)
      if (data?.module) {
        setMod(data.module)
      }
    } catch (err) {
      console.error('Failed to sync completion:', err)
    } finally {
      setMarking(false)
    }
  }

  useEffect(() => {
    setMod(null)
    setError('')
    api.get(`/curriculum/modules/${moduleKey}`)
      .then(({ data }) => {
        setMod(data.module)
        if (data.module?.completedVideos) {
          const map = {}
          data.module.completedVideos.forEach(u => {
            map[u] = true
            const yId = getYouTubeId(u)
            if (yId) map[yId] = true
          })
          setMarkedVideos(map)
        }
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load module'))
  }, [moduleKey])

  if (error) {
    return (
      <Layout title="Module">
        <div className="max-w-3xl mx-auto"><Alert type="error" message={error} /></div>
      </Layout>
    )
  }
  if (!mod) return <Layout title="Module"><PageLoader text="Loading module..." /></Layout>

  const level = getLevel(mod.level)
  const visibleVideos = mod.videos || []
  const video = visibleVideos[activeVideo] || visibleVideos[0]

  const completedCount = visibleVideos.filter(v => isVideoWatched(v)).length
  const totalCount = visibleVideos.length
  const allVideosCompleted = totalCount === 0 || completedCount >= totalCount || mod.isQuizUnlocked
  const isPassed = mod.status === 'passed'

  return (
    <Layout title={mod.title}>
      <div className="max-w-4xl mx-auto space-y-5">
        <div>
          <Link to="/curriculum" className="text-sm text-slate-400 hover:text-white transition-colors">← Curriculum</Link>
          <div className="flex items-center gap-3 mt-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${level.badge}`}>
              <span className={`w-2 h-2 rounded-full inline-block bg-current ${level.iconColor}`} /> {level.label}
            </span>
            <span className="text-xs font-semibold text-slate-500">{mod.category?.name}</span>
            {isPassed && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 size={12} /> Passed ({mod.bestScorePercent}%)
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black text-white mt-2">{mod.title}</h1>
          {mod.description && <p className="text-sm text-slate-400 mt-1">{mod.description}</p>}
        </div>

        {/* Video progress counter */}
        {totalCount > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-white">Video Progress</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {allVideosCompleted
                  ? 'All videos in this level completed! The quiz is unlocked.'
                  : `Complete all videos in this level to unlock the gate quiz.`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-black px-3 py-1 rounded-full ${allVideosCompleted ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-primary-500/20 text-primary-400 border border-primary-500/30'}`}>
                {completedCount} / {totalCount} Watched
              </span>
            </div>
          </div>
        )}

        {visibleVideos.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-slate-400">No videos published for this module yet.</p>
          </div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <div className="aspect-video bg-black">
              <iframe
                key={video?._id || activeVideo}
                src={toEmbedUrl(video?.url)}
                title={video?.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold text-white">{video?.title}</h3>
                {video?.source && <p className="text-xs text-slate-500 mt-0.5">{video?.source}</p>}
                {video?.whySelected && <p className="text-sm text-slate-400 mt-2">{video?.whySelected}</p>}
              </div>
              <button 
                onClick={() => handleMarkComplete(video)} 
                disabled={marking || isVideoWatched(video)}
                className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                  isVideoWatched(video)
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                    : 'bg-primary-600 hover:bg-primary-500 text-white shadow-sm'
                }`}
              >
                {isVideoWatched(video) ? (
                  <>
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span>Watched</span>
                  </>
                ) : (
                  <span>{marking ? 'Marking...' : 'Mark as Watched'}</span>
                )}
              </button>
            </div>

            {visibleVideos.length > 1 && (
              <div className="flex flex-wrap gap-2 px-4 pb-4">
                {visibleVideos.map((v, i) => {
                  const watched = isVideoWatched(v)
                  return (
                    <button key={v._id || i} onClick={() => setActiveVideo(i)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                        i === activeVideo
                          ? 'bg-primary-600 border-primary-500 text-white'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}>
                      {watched ? <CheckCircle2 size={12} className="text-emerald-400" /> : <PlayCircle size={12} />}
                      <span>{i + 1}. {v.title.length > 30 ? v.title.slice(0, 30) + '…' : v.title}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {mod.notes && (
          <div className="card">
            <h3 className="font-bold text-white mb-3">Notes</h3>
            <Markdown>{mod.notes}</Markdown>
          </div>
        )}

        {/* Gate Quiz Section with strict video completion locking */}
        <div className={`card p-6 flex flex-col sm:flex-row items-center justify-between gap-5 border transition-all ${
          isPassed
            ? 'bg-emerald-950/20 border-emerald-500/30'
            : allVideosCompleted
              ? 'bg-primary-950/20 border-primary-500/40'
              : 'bg-white/[0.02] border-white/10 opacity-80'
        }`}>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-lg">Level {level.label} Assessment Quiz</h3>
              {isPassed && (
                <span className="text-xs bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  PASSED
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400 mt-1">
              {isPassed
                ? `You passed this assessment with ${mod.bestScorePercent}%. The next level in ${mod.category?.name} is unlocked.`
                : allVideosCompleted
                  ? `All videos completed! Pass this quiz to unlock the next level in ${mod.category?.name}.`
                  : `Complete all ${totalCount} videos in Level ${level.label} to unlock this quiz (${completedCount}/${totalCount} completed).`}
            </p>
          </div>

          <div className="flex-shrink-0 w-full sm:w-auto">
            {mod.quizId ? (
              allVideosCompleted || isPassed ? (
                <button
                  onClick={() => navigate(`/quiz/${mod.quizId}`)}
                  className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 font-bold shadow-lg hover:scale-105 transition-all"
                >
                  <Trophy size={18} />
                  <span>{isPassed ? 'Review / Retake Quiz' : 'Start Assessment Quiz →'}</span>
                </button>
              ) : (
                <button
                  disabled
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-slate-400 font-bold rounded-xl cursor-not-allowed select-none opacity-60"
                  title="Watch all videos in this level to unlock the quiz"
                >
                  <Lock size={16} />
                  <span>Quiz Locked ({completedCount}/{totalCount})</span>
                </button>
              )
            ) : (
              <span className="text-sm text-slate-500 italic">Quiz coming soon</span>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
