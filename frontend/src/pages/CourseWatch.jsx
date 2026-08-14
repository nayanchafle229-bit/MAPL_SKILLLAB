import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { BrainCircuit, BookOpen, FileText, ClipboardList, Clapperboard, Circle } from 'lucide-react'
import ReactPlayer from 'react-player'
import api from '../api/axios'
import Layout from '../components/Layout'
import { PageLoader } from '../components/UI'
import { getLevel } from '../utils/levels'
import Markdown from '../components/Markdown'

function getYouTubeId(url) {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
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

  // Read fullscreen query param
  const isFullscreen = new URLSearchParams(window.location.search).get('fullscreen') === 'true';

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

  const level = getLevel(course.level)
  const hasNotes = !!course.notes?.trim()

  const handleVideoEnded = () => {
    if (progress?.status !== 'completed') {
      markComplete()
    }
  }

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        <div className="absolute top-4 right-4 z-50">
          <Link to={`/courses/${id}`} className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 backdrop-blur-sm transition-colors flex items-center justify-center" title="Exit Full Screen">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </Link>
        </div>
        <ReactPlayer 
          url={course.videoUrl} 
          width="100%" 
          height="100%" 
          playing={true} 
          controls 
          onEnded={handleVideoEnded} 
        />
      </div>
    )
  }

  return (
    <Layout title={course.title}>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main video */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-black rounded-2xl overflow-hidden aspect-video">
            <ReactPlayer 
              url={course.videoUrl} 
              width="100%" 
              height="100%" 
              controls 
              onEnded={handleVideoEnded} 
            />
          </div>

          <div className="card">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-xl font-black text-white mb-2">{course.title}</h1>
                <div className="flex items-center gap-2 flex-wrap">
                  {course.category && <span className="badge-blue">{course.category}</span>}
                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border ${level.badge}`}>
                    <span className={`w-2 h-2 rounded-full inline-block bg-current ${level.iconColor}`} /> {level.label}
                  </span>
                  {progress?.status === 'completed' && (
                    <span className="inline-flex items-center gap-1 bg-accent-500/15 text-accent-400 text-xs font-black px-3 py-1 rounded-full">
                      ✓ Completed
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link to="/quiz" className="btn-primary text-sm flex items-center justify-center gap-1.5"><BrainCircuit size={16}/> Take Quiz</Link>
              </div>
            </div>

            {/* Overview / Notes tabs — like Coursera's video + reading material tabs */}
            <div className="mt-5 flex items-center gap-1 border-b border-white/10">
              <button onClick={() => setTab('overview')}
                className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${tab === 'overview' ? 'border-primary-400 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
                <BookOpen size={16}/> Overview
              </button>
              <button onClick={() => setTab('notes')}
                className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${tab === 'notes' ? 'border-primary-400 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
                <FileText size={16}/> Notes {hasNotes && <span className="ml-1 w-1.5 h-1.5 rounded-full bg-primary-400 inline-block align-middle" />}
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
            <h3 className="font-bold text-white mb-3 flex items-center gap-2"><ClipboardList size={20}/> Other Courses</h3>
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
                          : <div className="w-full h-full flex items-center justify-center text-slate-400"><Clapperboard size={24} /></div>}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-100 line-clamp-2 group-hover:text-primary-400 transition-colors">{c.title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {c.category && <p className="text-xs text-slate-500">{c.category}</p>}
                          <span className={`w-2 h-2 rounded-full inline-block bg-current ${cLevel.iconColor}`} />
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
              <div className="mb-2 flex justify-center text-primary-400"><BrainCircuit size={48} /></div>
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
