import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import Markdown from '../../components/Markdown'
import api from '../../api/axios'
import { PageLoader, Alert } from '../../components/UI'
import { getLevel } from '../../utils/levels'

// Turns a YouTube watch/share URL into an embeddable one. Videos are
// curated as plain YouTube links in the source workbook, not embed URLs.
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

export default function ModuleDetail() {
  const { moduleKey } = useParams()
  const navigate = useNavigate()
  const [mod, setMod] = useState(null)
  const [activeVideo, setActiveVideo] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    setMod(null)
    setError('')
    api.get(`/curriculum/modules/${moduleKey}`)
      .then(({ data }) => setMod(data.module))
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
  const video = mod.videos[activeVideo]

  return (
    <Layout title={mod.title}>
      <div className="max-w-4xl mx-auto space-y-5">
        <div>
          <Link to="/curriculum" className="text-sm text-slate-400 hover:text-white transition-colors">← Curriculum</Link>
          <div className="flex items-center gap-3 mt-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${level.badge}`}>
              {level.icon} {level.label}
            </span>
            <span className="text-xs font-semibold text-slate-500">{mod.category?.name}</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-2">{mod.title}</h1>
          {mod.description && <p className="text-sm text-slate-400 mt-1">{mod.description}</p>}
        </div>

        {mod.videos.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-slate-400">No videos published for this module yet.</p>
          </div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <div className="aspect-video bg-black">
              <iframe
                key={video._id || activeVideo}
                src={toEmbedUrl(video.url)}
                title={video.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-white">{video.title}</h3>
              {video.source && <p className="text-xs text-slate-500 mt-0.5">{video.source}</p>}
              {video.whySelected && <p className="text-sm text-slate-400 mt-2">{video.whySelected}</p>}
            </div>
            {mod.videos.length > 1 && (
              <div className="flex flex-wrap gap-2 px-4 pb-4">
                {mod.videos.map((v, i) => (
                  <button key={v._id || i} onClick={() => setActiveVideo(i)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      i === activeVideo ? 'bg-primary-600 border-primary-500 text-white' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}>
                    {i + 1}. {v.title.length > 32 ? v.title.slice(0, 32) + '…' : v.title}
                  </button>
                ))}
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

        <div className="card flex items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-white">Ready for the gate quiz?</h3>
            <p className="text-sm text-slate-400 mt-0.5">Passing this unlocks the next level in this category.</p>
          </div>
          {mod.quizId ? (
            <button onClick={() => navigate(`/quiz/${mod.quizId}`)} className="btn-primary flex-shrink-0">
              Start Quiz
            </button>
          ) : (
            <span className="text-sm text-slate-500 flex-shrink-0">Quiz coming soon</span>
          )}
        </div>
      </div>
    </Layout>
  )
}
