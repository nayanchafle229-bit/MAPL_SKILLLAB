import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'
import Layout from '../components/Layout'
import { PageLoader } from '../components/UI'
import { getLevel } from '../utils/levels'
import Markdown from '../components/Markdown'

function getYouTubeId(url) {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

function getEmbedUrl(url) {
  const ytId = getYouTubeId(url)
  if (ytId) return `https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`
  return url
}

// (rich notes rendering now handled by the shared <Markdown> component)

export default function CourseWatch() {
  const { id } = useParams()
  const [course, setCourse]   = useState(null)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(null) // { status, completedAt, ... } | null
  const [marking, setMarking] = useState(false)
  const [tab, setTab] = useState('overview') // 'overview' | 'notes'

  useEffect(() => {
    Promise.all([api.get(`/course/${id}`), api.get('/course')])
      .then(([cRes, allRes]) => {
        setCourse(cRes.data.course)
        setCourses((allRes.data.courses || []).filter(c => c._id !== id).slice(0, 5))
      })
      .finally(() => setLoading(false))

    // Log that this student opened the course (creates/bumps a progress record)
    api.post(`/course/${id}/watch`)
      .then(({ data }) => setProgress(data.progress))
      .catch(() => {}) // non-fatal — e.g. admin account, or a transient error

    setTab('overview')
  }, [id])

  const markComplete = () => {
    setMarking(true)
    api.post(`/course/${id}/complete`)
      .then(({ data }) => setProgress(data.progress))
      .finally(() => setMarking(false))
  }

  if (loading) return <Layout title="Course"><PageLoader /></Layout>
  if (!course) return <Layout title="Course"><p className="text-slate-400">Course not found.</p></Layout>

  const embedUrl = getEmbedUrl(course.videoUrl)
  const level = getLevel(course.level)
  const hasNotes = !!course.notes?.trim()

  return (
    <Layout title={course.title}>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main video */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-black rounded-2xl overflow-hidden aspect-video">
            <iframe src={embedUrl} title={course.title}
              className="w-full h-full" allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
          </div>

          <div className="card">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-xl font-black text-white mb-2">{course.title}</h1>
                <div className="flex items-center gap-2 flex-wrap">
                  {course.category && <span className="badge-blue">{course.category}</span>}
                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border ${level.badge}`}>
                    {level.icon} {level.label}
                  </span>
                  {progress?.status === 'completed' && (
                    <span className="inline-flex items-center gap-1 bg-accent-500/15 text-accent-400 text-xs font-black px-3 py-1 rounded-full">
                      ✓ Completed
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {progress?.status !== 'completed' && (
                  <button onClick={markComplete} disabled={marking}
                    className="text-sm font-bold px-4 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors">
                    {marking ? 'Saving...' : '✓ Mark as Completed'}
                  </button>
                )}
                <Link to="/quiz" className="btn-primary text-sm">🧠 Take Quiz</Link>
              </div>
            </div>

            {/* Overview / Notes tabs — like Coursera's video + reading material tabs */}
            <div className="mt-5 flex items-center gap-1 border-b border-white/10">
              <button onClick={() => setTab('overview')}
                className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${tab === 'overview' ? 'border-primary-400 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
                📖 Overview
              </button>
              <button onClick={() => setTab('notes')}
                className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${tab === 'notes' ? 'border-primary-400 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
                📝 Notes {hasNotes && <span className="ml-1 w-1.5 h-1.5 rounded-full bg-primary-400 inline-block align-middle" />}
              </button>
            </div>

            <div className="pt-4">
              {tab === 'overview' ? (
                <>
                  <p className="text-slate-400 leading-relaxed">{course.description}</p>
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs text-slate-500">Added on {new Date(course.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </>
              ) : hasNotes ? (
                <Markdown>{course.notes}</Markdown>
              ) : (
                <p className="text-sm text-slate-500 italic">No notes have been added for this course yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-bold text-white mb-3">📋 Other Courses</h3>
            {courses.length === 0 ? (
              <p className="text-sm text-slate-500">No other courses available.</p>
            ) : (
              <div className="space-y-3">
                {courses.map(c => {
                  const ytId = getYouTubeId(c.videoUrl)
                  const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null
                  const cLevel = getLevel(c.level)
                  return (
                    <Link to={`/courses/${c._id}`} key={c._id}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all group">
                      <div className="w-20 h-14 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                        {thumb ? <img src={thumb} alt={c.title} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-2xl">🎬</div>}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-100 line-clamp-2 group-hover:text-primary-400 transition-colors">{c.title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {c.category && <p className="text-xs text-slate-500">{c.category}</p>}
                          <span className="text-xs">{cLevel.icon}</span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          <div className="card bg-gradient-to-br from-primary-500/10 to-accent-500/10 border-primary-500/20">
            <div className="text-center">
              <div className="text-3xl mb-2">🧠</div>
              <h3 className="font-bold text-white mb-1">Ready to test yourself?</h3>
              <p className="text-sm text-slate-400 mb-4">Take a quiz with {40} random questions</p>
              <Link to="/quiz" className="btn-primary w-full text-center block">Start Quiz</Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
