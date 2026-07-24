import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import Layout from '../components/Layout'
import { PageLoader, EmptyState } from '../components/UI'
import { IconPlay, IconCalendar, IconBook } from '../components/Icons'
import '../styles/Courses.css'

function getYouTubeId(url) {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  return match ? match[1] : null
}

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  useEffect(() => {
    api.get('/course')
      .then(({ data }) => setCourses(data.courses || []))
      .finally(() => setLoading(false))
  }, [])

  const categories = ['All', ...new Set(courses.map((c) => c.category).filter(Boolean))]

  const filteredCourses = courses.filter((course) => {
    const searchMatch =
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.description?.toLowerCase().includes(search.toLowerCase()) ||
      course.category?.toLowerCase().includes(search.toLowerCase())
    const categoryMatch = selectedCategory === 'All' || course.category === selectedCategory
    return searchMatch && categoryMatch
  })

  const featuredCourse = filteredCourses.length > 0 ? filteredCourses[0] : null

  if (loading) {
    return <Layout title="Courses"><PageLoader /></Layout>
  }

  return (
    <Layout title="Courses">
      <div className="courses-page">

        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="lms-hero">
          <div className="hero-left">
            <span className="hero-badge">MAPL SkillLab</span>
            <h1>Industrial Automation<br />Learning Platform</h1>
            <p>
              Master DCS, PLC, SCADA, Instrumentation, Industrial Networking and Automation
              technologies through structured internal learning programs.
            </p>

            <div className="hero-search">
              <input
                type="text"
                placeholder="Search learning modules..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="category-row">
              {categories.map((category) => (
                <button
                  key={category}
                  className={selectedCategory === category ? 'category-chip active' : 'category-chip'}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="hero-right">
            <div className="featured-card">
              <span className="featured-title">FEATURED COURSE</span>
              {featuredCourse ? (
                <>
                  <h2>{featuredCourse.title}</h2>
                  <p>{featuredCourse.description}</p>
                  <div className="featured-meta">
                    <span>{featuredCourse.category}</span>
                    <span>{new Date(featuredCourse.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                  <Link to={`/courses/${featuredCourse._id}`} className="hero-button">
                    <IconPlay className="w-4 h-4" /> Start Learning
                  </Link>
                </>
              ) : (
                <>
                  <h2>Welcome to MAPL SkillLab</h2>
                  <p>Courses added by administrators will automatically appear here.</p>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ── Toolbar ──────────────────────────────────────── */}
        <section className="courses-toolbar">
          <div>
            <h2>Learning Modules</h2>
            <p>Browse all internal MAPL SkillLab courses.</p>
          </div>
          <div className="course-counter">
            {filteredCourses.length}
            <span>Courses</span>
          </div>
        </section>

        {/* ── Grid ─────────────────────────────────────────── */}
        <section className="course-grid">
          {filteredCourses.length === 0 ? (
            <EmptyState
              title="No Courses Found"
              description="Courses created by the administrator will appear here."
            />
          ) : (
            filteredCourses.map((course) => {
              const ytId = getYouTubeId(course.videoUrl)
              const thumbnail = ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : null

              return (
                <Link to={`/courses/${course._id}`} className="course-card" key={course._id}>
                  <div className="course-thumbnail">
                    {thumbnail
                      ? <img src={thumbnail} alt={course.title} />
                      : <div className="thumbnail-placeholder">No Preview</div>}
                    <div className="play-overlay">
                      <span className="play-button"><IconPlay className="w-6 h-6" /></span>
                    </div>
                    {course.category && <span className="course-category">{course.category}</span>}
                  </div>

                  <div className="course-content">
                    <div className="course-date">
                      <IconCalendar className="w-3.5 h-3.5" />
                      Added {new Date(course.createdAt).toLocaleDateString('en-IN')}
                    </div>
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>
                    <div className="course-footer">
                      <span className="start-learning">
                        <IconBook className="w-3.5 h-3.5" /> Start Learning
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })
          )}
        </section>

      </div>
    </Layout>
  )
}
