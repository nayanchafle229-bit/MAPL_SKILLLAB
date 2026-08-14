import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Pencil, Trash2, FileText, ExternalLink, Hourglass, BookOpen, Search, Circle } from 'lucide-react'
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

  const openAdd  = useCallback(() => { setEditing(null); setForm(EMPTY); setError(''); setNotesPreview(false); setModal(true) }, [])
  const openEdit = useCallback((c) => { setEditing(c); setForm({ title: c.title, description: c.description, videoUrl: c.videoUrl, category: c.category || '', level: c.level || 'easy', notes: c.notes || '' }); setError(''); setNotesPreview(false); setModal(true) }, [])
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

  const coursesGrid = useMemo(() => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {filteredCourses.map(c => (
        <div key={c._id} className="glass-panel group p-6 rounded-2xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col hover:border-white/20">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 group-hover:bg-primary-500/20 transition-all duration-500 z-0"></div>
          
          <div className="relative z-10 flex flex-col flex-1">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-primary-500/30 rounded-xl flex items-center justify-center text-primary-300 font-black text-lg flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                {c.title[0]}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => openEdit(c)} className="w-8 h-8 flex items-center justify-center bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 rounded-lg transition-colors border border-primary-500/20" title="Edit"><Pencil size={16} /></button>
                <button onClick={() => setDelId(c._id)} className="w-8 h-8 flex items-center justify-center bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20" title="Delete"><Trash2 size={16} /></button>
              </div>
            </div>
            
            <h3 className="font-black text-white text-lg mb-2 line-clamp-1 group-hover:text-primary-300 transition-colors">{c.title}</h3>
            <p className="text-sm text-slate-400 line-clamp-2 mb-4 font-medium leading-relaxed flex-1">{c.description}</p>
            
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {c.category && (
                <span className="bg-white/10 text-slate-300 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest border border-white/10 shadow-inner">
                  {c.category.split(' ')[0]} {/* Shortened for display */}
                </span>
              )}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black shadow-inner border ${getLevel(c.level).badge}`}>
                <Circle fill="currentColor" size={12} className={getLevel(c.level).iconColor} /> {getLevel(c.level).label}
              </span>
              {c.notes && <span className="text-[10px] uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full font-bold shadow-inner flex items-center gap-1"><FileText size={12} /> Notes</span>}
            </div>
            
            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <a href={c.videoUrl} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 font-bold bg-primary-500/10 px-3 py-1.5 rounded-lg hover:bg-primary-500/20 transition-colors border border-primary-500/20">
                <span><ExternalLink size={14} /></span> Open Video
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  ), [filteredCourses, openEdit])

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
                {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
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
              {saving ? <span className="flex items-center justify-center gap-2"><Hourglass size={16} /> Saving...</span> : editing ? 'Update Course' : 'Add Course'}
            </button>
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>

      <div className="mb-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2"><BookOpen size={28} /> Manage Courses</h2>
          <p className="text-slate-400 text-sm">{courses.length} course{courses.length !== 1 ? 's' : ''} total</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <select value={activeCategory} onChange={e => setActiveCategory(e.target.value)} className="input-field flex-1 sm:max-w-[250px]">
            <option value="All">All Categories</option>
            {CATS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={activeLevel} onChange={e => setActiveLevel(e.target.value)} className="input-field flex-1 sm:max-w-[160px]">
            <option value="All">All Levels</option>
            {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
          <input type="text" placeholder="Search..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="input-field flex-1 sm:max-w-[160px]" />
          <button onClick={openAdd} className="btn-primary flex-shrink-0 whitespace-nowrap">+ Add Course</button>
        </div>
      </div>

      {success && <div className="mb-4"><Alert type="success" message={success} /></div>}

      {courses.length === 0 ? (
        <EmptyState icon={<BookOpen size={48} />} title="No courses yet" description="Add your first course to get started."
          action={<button onClick={openAdd} className="btn-primary">+ Add Course</button>} />
      ) : filteredCourses.length === 0 ? (
        <EmptyState icon={<Search size={48} />} title="No matching courses" description="Try adjusting your search or filters." />
      ) : (
        coursesGrid
      )}
    </Layout>
  )
}
