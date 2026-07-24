import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'
import Layout from '../components/Layout'
import { PageLoader } from '../components/UI'
import { IconBrain, IconLayers, IconFilm } from '../components/Icons'

function getYouTubeId(url) {
  const m = url?.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

function getEmbedUrl(url) {
  const ytId = getYouTubeId(url)
  if (ytId) return `https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`
  return url
}

export default function CourseWatch() {
  const { id } = useParams()
  const [course, setCourse] = useState(null)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([api.get(`/course/${id}`), api.get('/course')])
      .then(([cRes, allRes]) => {
        setCourse(cRes.data.course)
        setCourses((allRes.data.courses || []).filter(c => c._id !== id).slice(0, 5))
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Layout title="Course"><PageLoader /></Layout>
  if (!course) return <Layout title="Course"><p className="text-gray-500">Course not found.</p></Layout>

  const embedUrl = getEmbedUrl(course.videoUrl)

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
                <h1 className="text-xl font-black text-gray-900 mb-2">{course.title}</h1>
                {course.category && <span className="badge-blue">{course.category}</span>}
              </div>
              <Link to="/quizzes" className="btn-primary text-sm flex-shrink-0 flex items-center gap-2">
                <IconBrain className="w-4 h-4" /> Take Quiz
              </Link>
            </div>
            <p className="text-gray-600 mt-4 leading-relaxed">{course.description}</p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">Added on {new Date(course.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="flex items-center gap-2 font-bold text-gray-900 mb-3">
              <IconLayers className="w-4 h-4 text-primary-500" /> Other Courses
            </h3>
            {courses.length === 0 ? (
              <p className="text-sm text-gray-400">No other courses available.</p>
            ) : (
              <div className="space-y-3">
                {courses.map(c => {
                  const ytId = getYouTubeId(c.videoUrl)
                  const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null
                  return (
                    <Link to={`/courses/${c._id}`} key={c._id}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-all group">
                      <div className="w-20 h-14 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {thumb
                          ? <img src={thumb} alt={c.title} className="w-full h-full object-cover" />
                          : <IconFilm className="w-5 h-5 text-slate-400" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-primary-600 transition-colors">{c.title}</p>
                        {c.category && <p className="text-xs text-gray-400 mt-0.5">{c.category}</p>}
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          <div className="card bg-gradient-to-br from-primary-50 to-purple-50 border-primary-100">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto mb-3 text-primary-600">
                <IconBrain className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Ready to test yourself?</h3>
              <p className="text-sm text-gray-500 mb-4">Put what you just watched into practice with a quiz.</p>
              <Link to="/quizzes" className="btn-primary w-full text-center block">Browse Quizzes</Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
