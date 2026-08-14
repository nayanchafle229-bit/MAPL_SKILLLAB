import React, { useState, useEffect, useMemo } from 'react'
import { Clapperboard, Trophy, BookOpen, Circle } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import Layout from '../components/Layout'
import { PageLoader, EmptyState } from '../components/UI'
import { LEVELS, getLevel } from '../utils/levels'

function getYouTubeId(url) {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

function CourseCard({ c }) {
  const ytId = getYouTubeId(c.videoUrl)
  const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null
  const level = getLevel(c.level)

  if (c.locked) {
    return (
      <div className="glass-panel p-0 overflow-hidden flex-shrink-0 flex flex-col opacity-60 grayscale cursor-not-allowed border-dashed relative">
        <div className="absolute inset-0 bg-black/40 z-10 flex flex-col items-center justify-center backdrop-blur-[2px]">
          <div className="w-14 h-14 bg-slate-800/80 rounded-full flex items-center justify-center mb-3 shadow-lg border border-slate-700/50">
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7z" />
            </svg>
          </div>
          <span className="font-black text-white tracking-widest uppercase text-sm drop-shadow-md">Locked</span>
        </div>
        <div className="relative aspect-video bg-slate-800 overflow-hidden flex items-center justify-center">
          {thumb && <img src={thumb} alt={c.title} className="w-full h-full object-cover opacity-50" />}
        </div>
        <div className="p-5 flex-1 flex flex-col relative z-0">
          <h3 className="font-bold text-slate-400 mb-1 line-clamp-1 text-lg">{c.title}</h3>
          <p className="text-sm text-slate-500 line-clamp-2 mb-4">{c.description}</p>
          <div className="mt-auto flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-slate-700/50 text-slate-400 border border-slate-600/30">
              <Circle fill="currentColor" size={12} className={level.iconColor} /> {level.label}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-panel group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 p-0 overflow-hidden flex-shrink-0 flex flex-col hover:border-white/20">
      <Link to={`/courses/${c._id}`} className="block relative aspect-video bg-gradient-to-br from-slate-800 to-surface-card overflow-hidden">
        {thumb
          ? <img src={thumb} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
          : <div className="w-full h-full flex items-center justify-center opacity-50 group-hover:scale-110 transition-transform duration-700"><Clapperboard size={48} className="opacity-50" /></div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)] border border-white/40 scale-90 group-hover:scale-100 transition-transform duration-300">
            <svg className="w-6 h-6 text-white ml-1 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
        {c.category && (
          <span className="absolute top-4 left-4 bg-primary-600/90 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-black px-3 py-1.5 rounded-full shadow-lg border border-primary-500/50">
            {c.category}
          </span>
        )}
      </Link>
      <div className="p-5 flex-1 flex flex-col relative">
        <div className="absolute top-0 right-5 -translate-y-1/2">
          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md border border-white/10 ${level.chip}`}>
            <Circle fill="currentColor" size={12} className={level.iconColor} /> {level.label}
          </span>
        </div>
        
        <Link to={`/courses/${c._id}`} className="block mt-2">
          <h3 className="font-bold text-white mb-2 line-clamp-1 group-hover:text-primary-400 transition-colors text-lg">{c.title}</h3>
          <p className="text-sm text-slate-400 line-clamp-2 mb-4 leading-relaxed font-medium">{c.description}</p>
        </Link>
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
          <Link to={`/courses/${c._id}`} className="text-primary-400 text-sm font-bold hover:text-primary-300 flex items-center gap-1.5 transition-colors group/link">
            <span>Watch Now</span>
            <span className="group-hover/link:translate-x-1 transition-transform">→</span>
          </Link>
          <div className="flex items-center gap-2">
            {/* Open in New Tab */}
            <a href={`/courses/${c._id}`} target="_blank" rel="noopener noreferrer" 
               className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white bg-white/5 hover:bg-white/15 rounded-full transition-colors border border-white/5 hover:border-white/20" title="Open in new tab">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </a>
            {/* Full Screen mode via query param */}
            <Link to={`/courses/${c._id}?fullscreen=true`}
               className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white bg-white/5 hover:bg-white/15 rounded-full transition-colors border border-white/5 hover:border-white/20" title="Watch Full Screen">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeLevel, setActiveLevel] = useState('All')
  const [pendingQuiz, setPendingQuiz] = useState(null)
  const [pendingLevel, setPendingLevel] = useState(null)

  useEffect(() => {
    api.get('/course')
      .then(({ data }) => {
        setCourses(data.courses || [])
        setPendingQuiz(data.pendingLevelQuiz || null)
        setPendingLevel(data.pendingLevel || null)
      })
      .finally(() => setLoading(false))
  }, [])

  // Categories derived from the actual courses, Coursera/Udemy-style chips
  const categories = useMemo(() => {
    const counts = {}
    courses.forEach(c => {
      const cat = c.category || 'General'
      counts[cat] = (counts[cat] || 0) + 1
    })
    return Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]))
  }, [courses])

  const searched = useMemo(() => courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category?.toLowerCase().includes(search.toLowerCase())
  ), [courses, search])

  const filtered = useMemo(() => searched.filter(c =>
    (activeCategory === 'All' || (c.category || 'General') === activeCategory) &&
    (activeLevel === 'All' || (c.level || 'easy') === activeLevel)
  ), [searched, activeCategory, activeLevel])

  // Group the filtered results by level so they read like Coursera's
  // "Beginner / Intermediate / Advanced" learning-path rows.
  const grouped = useMemo(() => {
    const groups = LEVELS.map(l => ({ ...l, courses: filtered.filter(c => (c.level || 'easy') === l.value) }))
    return groups.filter(g => g.courses.length > 0)
  }, [filtered])

  if (loading) return <Layout title="Courses"><PageLoader /></Layout>

  return (
    <Layout title="Courses">
      {pendingQuiz && pendingLevel && (
        <div className="mb-8 p-6 bg-primary-900/40 border border-primary-500/30 rounded-xl flex items-center justify-between gap-6 shadow-lg">
          <div>
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Trophy size={28} /> Level {getLevel(pendingLevel).label} Complete!
            </h3>
            <p className="text-slate-300">
              You have completed all courses in the {getLevel(pendingLevel).label} level. 
              Take the level quiz to unlock the next level.
            </p>
          </div>
          <Link to={`/quizzes/${pendingQuiz._id}`} className="btn-primary flex-shrink-0 whitespace-nowrap shadow-primary-600/20 shadow-lg px-8 py-3 rounded-xl font-bold text-lg hover:scale-105 transition-transform">
            Take Level Quiz
          </Link>
        </div>
      )}

      <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white"><BookOpen size={24} className="inline-block mr-1 -mt-1" /> All Courses</h2>
          <p className="text-slate-400 text-sm mt-1">{courses.length} course{courses.length !== 1 ? 's' : ''} available</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <select value={activeCategory} onChange={e => setActiveCategory(e.target.value)} className="input-field flex-1 sm:max-w-[250px]">
            <option value="All">All Categories</option>
            {categories.map(([name, count]) => (
              <option key={name} value={name}>{name} ({count})</option>
            ))}
          </select>
          <select value={activeLevel} onChange={e => setActiveLevel(e.target.value)} className="input-field flex-1 sm:max-w-[160px]">
            <option value="All">All Levels</option>
            {LEVELS.map(l => (
              <option key={l.value} value={l.value}>{l.icon} {l.label}</option>
            ))}
          </select>
          <input type="text" placeholder="Search courses..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="input-field flex-1 sm:max-w-xs" />
        </div>
      </div>

      {/* Browse by category — Coursera/Udemy style chip row */}
      <div className="mb-4 overflow-x-auto pb-1">
        <div className="flex items-center gap-2 min-w-max">
          <button onClick={() => setActiveCategory('All')}
            className={`text-sm font-semibold px-4 py-2 rounded-full border transition-colors flex-shrink-0 ${activeCategory === 'All' ? 'bg-primary-600 border-primary-600 text-white' : 'border-white/10 text-slate-300 hover:bg-white/5'}`}>
            All Categories
          </button>
          {categories.map(([name, count]) => (
            <button key={name} onClick={() => setActiveCategory(name)}
              className={`text-sm font-semibold px-4 py-2 rounded-full border transition-colors flex-shrink-0 ${activeCategory === name ? 'bg-primary-600 border-primary-600 text-white' : 'border-white/10 text-slate-300 hover:bg-white/5'}`}>
              {name} <span className="opacity-70">({count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Browse by level */}
      <div className="mb-6 overflow-x-auto pb-1">
        <div className="flex items-center gap-2 min-w-max">
          <button onClick={() => setActiveLevel('All')}
            className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors flex-shrink-0 ${activeLevel === 'All' ? 'bg-slate-600 border-slate-600 text-white' : 'border-white/10 text-slate-400 hover:bg-white/5'}`}>
            All Levels
          </button>
          {LEVELS.map(l => (
            <button key={l.value} onClick={() => setActiveLevel(l.value)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors flex-shrink-0 ${activeLevel === l.value ? `${l.chip} border-transparent` : 'border-white/10 text-slate-400 hover:bg-white/5'}`}>
              {l.icon} {l.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<BookOpen size={48} />} title="No courses found" description={search || activeCategory !== 'All' || activeLevel !== 'All' ? 'Try a different search, category or level.' : 'The admin hasn\'t added any courses yet.'} />
      ) : activeLevel !== 'All' ? (
        // A specific level is selected — just show a flat grid
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(c => <CourseCard key={c._id} c={c} />)}
        </div>
      ) : (
        // No level filter — show Coursera-style rows grouped by level
        <div className="space-y-8">
          {grouped.map(g => (
            <div key={g.value}>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-lg font-black text-white">{g.icon} {g.label}</h3>
                <span className="text-xs text-slate-500">{g.courses.length} course{g.courses.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {g.courses.map(c => <CourseCard key={c._id} c={c} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
