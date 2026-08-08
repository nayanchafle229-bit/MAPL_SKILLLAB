import React, { useState, useEffect, useMemo } from 'react'
import api from '../../api/axios'
import Layout from '../../components/Layout'
import { Modal, ConfirmDialog, Alert, PageLoader, EmptyState } from '../../components/UI'
import { LEVELS, getLevel } from '../../utils/levels'
import Markdown from '../../components/Markdown'

const EMPTY = { title: '', description: '', videoUrl: '', category: 'Industrial Automation Concepts & Process Control', level: 'easy', notes: '' }
const CATS = [
  'Industrial Automation Concepts & Process Control',
  'Field Instrumentation, Final Control Elements & Loop Engineering',
  'Control System Hardware, Panel & Architecture Design',
  'Industrial Communication Protocols & Networks',
  'Control Logic Programming & Configuration',
  'HMI/SCADA Design, Alarm Management & Operations',
  'Standards, Codes & Engineering Documentation',
  'Functional Safety, Interlocks & Critical Systems',
  'Industry Application Engineering (Vertical Domains)',
  'Industrial Data, Historians & OT Cybersecurity',
  'Project Execution, Commissioning & Lifecycle Support'
]

export default function AdminCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(false)
  const [editing, setEditing] = useState(null)
  const [form,    setForm]    = useState(EMPTY)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')
  const [delId,   setDelId]   = useState(null)
  const [notesPreview, setNotesPreview] = useState(false)
  const [search, setSearch]   = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeLevel, setActiveLevel] = useState('All')

  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || 
                          (c.category && c.category.toLowerCase().includes(search.toLowerCase()))
      const matchCat = activeCategory === 'All' || c.category === activeCategory
      const matchLevel = activeLevel === 'All' || c.level === activeLevel
      return matchSearch && matchCat && matchLevel
    })
  }, [courses, search, activeCategory, activeLevel])
  const load = () => {
    setLoading(true)
    api.get('/course').then(({ data }) => setCourses(data.courses || [])).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openAdd  = () => { setEditing(null); setForm(EMPTY); setError(''); setNotesPreview(false); setModal(true) }
  const openEdit = (c) => { setEditing(c); setForm({ title: c.title, description: c.description, videoUrl: c.videoUrl, category: c.category || '', level: c.level || 'easy', notes: c.notes || '' }); setError(''); setNotesPreview(false); setModal(true) }
  const handle   = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const save = async (e) => {
    e.preventDefault()
    if (!form.title || !form.description || !form.videoUrl) { setError('All fields are required'); return }
    setSaving(true); setError('')
    try {
      if (editing) { await api.put(`/course/${editing._id}`, form) }
      else         { await api.post('/course', form) }
      setModal(false)
      setSuccess(editing ? 'Course updated!' : 'Course created!')
      setTimeout(() => setSuccess(''), 3000)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save')
    } finally { setSaving(false) }
  }

  const deleteCourse = async () => {
    await api.delete(`/course/${delId}`)
    setDelId(null)
    setSuccess('Course deleted.')
    setTimeout(() => setSuccess(''), 2000)
    load()
  }

  if (loading) return <Layout title="Manage Courses"><PageLoader /></Layout>

  return (
    <Layout title="Manage Courses">
      <ConfirmDialog open={!!delId} onClose={() => setDelId(null)} onConfirm={deleteCourse}
        title="Delete Course?" message="This will permanently remove this course." confirmLabel="Delete" danger />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Course' : 'Add New Course'} wide>
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Title *</label>
            <input name="title" value={form.title} onChange={handle} placeholder="e.g. JavaScript Fundamentals" className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Description *</label>
            <textarea name="description" value={form.description} onChange={handle} rows={3}
              placeholder="Brief course description..." className="input-field resize-none" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Video URL *</label>
            <input name="videoUrl" value={form.videoUrl} onChange={handle} placeholder="https://youtube.com/watch?v=..." className="input-field" required />
            <p className="text-xs text-slate-500 mt-1">YouTube URLs are supported and will auto-embed.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1">Category</label>
              <select name="category" value={form.category} onChange={handle} className="input-field">
                <option value="">Select category</option>
                {CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1">Level *</label>
              <select name="level" value={form.level} onChange={handle} className="input-field" required>
                {LEVELS.map(l => <option key={l.value} value={l.value}>{l.icon} {l.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-semibold text-slate-300">Notes (optional)</label>
              <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
                <button type="button" onClick={() => setNotesPreview(false)}
                  className={`text-xs font-bold px-3 py-1 rounded-md transition-colors ${!notesPreview ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                  Write
                </button>
                <button type="button" onClick={() => setNotesPreview(true)}
                  className={`text-xs font-bold px-3 py-1 rounded-md transition-colors ${notesPreview ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                  Preview
                </button>
              </div>
            </div>
            {notesPreview ? (
              <div className="input-field min-h-[160px] max-h-72 overflow-y-auto">
                {form.notes.trim()
                  ? <Markdown>{form.notes}</Markdown>
                  : <p className="text-sm text-slate-500 italic">Nothing to preview yet — write some notes first.</p>}
              </div>
            ) : (
              <textarea name="notes" value={form.notes} onChange={handle} rows={7}
                placeholder={'Full Markdown supported — like Coursera/Udemy course notes:\n\n# Heading\n**bold**, *italic*, `inline code`\n- bullet list\n1. numbered list\n> blockquote\n[link](https://example.com)\n\n```js\nconst x = 1;\n```'}
                className="input-field resize-none font-mono text-sm" />
            )}
            <p className="text-xs text-slate-500 mt-1">Shown in a "Notes" tab next to the video, like Coursera — supports headings, bold/italic, lists, tables, quotes, links and code blocks.</p>
          </div>
          {error && <Alert type="error" message={error} />}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? '⏳ Saving...' : editing ? 'Update Course' : 'Add Course'}
            </button>
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>

      <div className="mb-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">📚 Manage Courses</h2>
          <p className="text-slate-400 text-sm">{courses.length} course{courses.length !== 1 ? 's' : ''} total</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <select value={activeCategory} onChange={e => setActiveCategory(e.target.value)} className="input-field flex-1 sm:max-w-[250px]">
            <option value="All">All Categories</option>
            {CATS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={activeLevel} onChange={e => setActiveLevel(e.target.value)} className="input-field flex-1 sm:max-w-[160px]">
            <option value="All">All Levels</option>
            {LEVELS.map(l => <option key={l.value} value={l.value}>{l.icon} {l.label}</option>)}
          </select>
          <input type="text" placeholder="🔍 Search..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="input-field flex-1 sm:max-w-[160px]" />
          <button onClick={openAdd} className="btn-primary flex-shrink-0 whitespace-nowrap">+ Add Course</button>
        </div>
      </div>

      {success && <div className="mb-4"><Alert type="success" message={success} /></div>}

      {courses.length === 0 ? (
        <EmptyState icon="📚" title="No courses yet" description="Add your first course to get started."
          action={<button onClick={openAdd} className="btn-primary">+ Add Course</button>} />
      ) : filteredCourses.length === 0 ? (
        <EmptyState icon="🔍" title="No matching courses" description="Try adjusting your search or filters." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredCourses.map(c => (
            <div key={c._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                  {c.title[0]}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(c)} className="text-xs bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 px-3 py-1.5 rounded-lg font-semibold transition-colors">Edit</button>
                  <button onClick={() => setDelId(c._id)} className="text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-1.5 rounded-lg font-semibold transition-colors">Delete</button>
                </div>
              </div>
              <h3 className="font-bold text-white mb-1 line-clamp-1">{c.title}</h3>
              <p className="text-sm text-slate-400 line-clamp-2 mb-3">{c.description}</p>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {c.category && <span className="badge-blue">{c.category}</span>}
                <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${getLevel(c.level).badge}`}>
                  {getLevel(c.level).icon} {getLevel(c.level).label}
                </span>
                {c.notes && <span className="text-xs text-slate-500">📝 has notes</span>}
              </div>
              <div className="flex items-center justify-between">
                <a href={c.videoUrl} target="_blank" rel="noreferrer"
                  className="text-xs text-primary-400 hover:underline">🔗 Open Link</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
