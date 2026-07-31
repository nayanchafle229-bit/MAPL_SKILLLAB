import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import Layout from '../components/Layout'
import { PageLoader, EmptyState } from '../components/UI'

function getYouTubeId(url) {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')

  useEffect(() => {
    api.get('/course')
      .then(({ data }) => setCourses(data.courses || []))
      .finally(() => setLoading(false))
  }, [])

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <Layout title="Courses"><PageLoader /></Layout>

  return (
    <Layout title="Courses">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">📚 All Courses</h2>
          <p className="text-gray-500 text-sm mt-1">{courses.length} course{courses.length !== 1 ? 's' : ''} available</p>
        </div>
        <input type="text" placeholder="🔍 Search courses..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="input-field max-w-xs" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="📚" title="No courses found" description={search ? 'Try a different search term.' : 'The admin hasn\'t added any courses yet.'} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(c => {
            const ytId = getYouTubeId(c.videoUrl)
            const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null
            return (
              <Link to={`/courses/${c._id}`} key={c._id}
                className="card group hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer p-0 overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-slate-700 to-slate-900 relative overflow-hidden">
                  {thumb
                    ? <img src={thumb} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <div className="w-full h-full flex items-center justify-center text-5xl">🎬</div>
                  }
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-5 h-5 text-blue-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                  {c.category && (
                    <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      {c.category}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{c.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{c.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString('en-IN')}</span>
                    <span className="text-blue-600 text-sm font-semibold group-hover:underline">▶ Start Learning</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </Layout>
  )
}
