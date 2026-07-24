import React, { useState, useEffect } from 'react'
import api from '../../api/axios'
import Layout from '../../components/Layout'
import { Modal, ConfirmDialog, Alert, PageLoader, EmptyState } from '../../components/UI'
import { IconBook, IconPlay } from '../../components/Icons'

const EMPTY = { title: '', description: '', videoUrl: '', category: '' }
// NOTE: was ['JavaScript','React','Node.js','MongoDB','Python',...] — a generic
// web-dev bootcamp category list that didn't match this platform's actual
// subject matter (every other page markets it as Industrial Automation training).
const CATS = ['PLC', 'DCS', 'SCADA', 'Instrumentation', 'Industrial Networking', 'HMI', 'Process Automation', 'General', 'Other']

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

  const load = () => {
    setLoading(true)
    api.get('/course').then(({ data }) => setCourses(data.courses || [])).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openAdd  = () => { setEditing(null); setForm(EMPTY); setError(''); setModal(true) }
  const openEdit = (c) => { setEditing(c); setForm({ title: c.title, description: c.description, videoUrl: c.videoUrl, category: c.category || '' }); setError(''); setModal(true) }
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

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Course' : 'Add New Course'}>
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
            <input name="title" value={form.title} onChange={handle} placeholder="e.g. PLC Programming Fundamentals" className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
            <textarea name="description" value={form.description} onChange={handle} rows={3}
              placeholder="Brief course description..." className="input-field resize-none" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Video URL *</label>
            <input name="videoUrl" value={form.videoUrl} onChange={handle} placeholder="https://youtube.com/watch?v=..." className="input-field" required />
            <p className="text-xs text-gray-400 mt-1">YouTube URLs are supported and will auto-embed.</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
            <select name="category" value={form.category} onChange={handle} className="input-field">
              <option value="">Select category</option>
              {CATS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {error && <Alert type="error" message={error} />}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving...' : editing ? 'Update Course' : 'Add Course'}
            </button>
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-black text-gray-900">
            <IconBook className="w-6 h-6 text-primary-600" /> Courses
          </h2>
          <p className="text-gray-500 text-sm">{courses.length} course{courses.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openAdd} className="btn-primary">+ Add Course</button>
      </div>

      {success && <div className="mb-4"><Alert type="success" message={success} /></div>}

      {courses.length === 0 ? (
        <EmptyState icon={<IconBook className="w-7 h-7" />} title="No courses yet" description="Add your first course to get started."
          action={<button onClick={openAdd} className="btn-primary">+ Add Course</button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {courses.map(c => (
            <div key={c._id} className="quiz-card-hover card">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                  {c.title[0]}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(c)} className="text-xs bg-primary-50 text-primary-600 hover:bg-primary-100 px-3 py-1.5 rounded-lg font-semibold transition-colors">Edit</button>
                  <button onClick={() => setDelId(c._id)} className="text-xs bg-rose-50 text-rose-600 hover:bg-rose-100 px-3 py-1.5 rounded-lg font-semibold transition-colors">Delete</button>
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{c.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-3">{c.description}</p>
              <div className="flex items-center justify-between">
                {c.category && <span className="badge-blue">{c.category}</span>}
                <a href={c.videoUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-primary-500 hover:underline">
                  <IconPlay className="w-3 h-3" /> Open Link
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
