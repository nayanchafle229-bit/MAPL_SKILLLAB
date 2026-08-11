import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import Layout from '../../components/Layout'
import { PageLoader, EmptyState, ConfirmDialog, Alert } from '../../components/UI'
import { LEVELS } from '../../utils/levels'

export default function AdminQuizzes() {
  const [quizzes, setQuizzes]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [delId,   setDelId]     = useState(null)
  const [editModal, setEditModal] = useState(null)
  const [editForm,  setEditForm]  = useState({})
  const [saving,  setSaving]    = useState(false)
  const [success, setSuccess]   = useState('')
  const [error,   setError]     = useState('')
  const [search, setSearch]     = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [diffFilter, setDiffFilter] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    api.get('/admin/quiz')
      .then(({ data }) => setQuizzes(data.quizzes || []))
      .catch(err => setError(err.response?.data?.message || 'Failed to load quizzes'))
      .finally(() => setLoading(false))
  }, [])
  useEffect(() => { load() }, [load])

  const toast = useCallback((msg, isErr = false) => {
    if (isErr) setError(msg); else setSuccess(msg)
    setTimeout(() => { setSuccess(''); setError('') }, 3500)
  }, [])

  // ISSUE 4 FIX: publish/unpublish toggle
  const togglePublish = useCallback(async (q) => {
    try {
      const { data } = await api.patch(`/admin/quiz/${q._id}/publish`)
      toast(data.message)
      load()
    } catch (err) {
      toast(err.response?.data?.message || 'Failed', true)
    }
  }, [load, toast])

  const deleteQuiz = async () => {
    try {
      await api.delete(`/admin/quiz/${delId}`)
      setDelId(null)
      toast('Quiz deleted')
      load()
    } catch (err) {
      toast(err.response?.data?.message || 'Delete failed', true)
    }
  }

  const openEdit = useCallback((q) => {
    setEditForm({
      title:             q.title,
      description:       q.description || '',
      passMarks:         q.passMarks,
      duration:          q.duration,
      attemptsAllowed:   q.attemptsAllowed || 1,
      negativeMarking:   q.negativeMarking || false,
      negativeMarksPerQ: q.negativeMarksPerQ || 0.25,
    })
    setEditModal(q)
  }, [])

  const saveEdit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put(`/admin/quiz/${editModal._id}`, editForm)
      setEditModal(null)
      toast('Quiz updated')
      load()
    } catch (err) {
      toast(err.response?.data?.message || 'Update failed', true)
    } finally { setSaving(false) }
  }

  const StatusBadge = ({ status }) => (
    <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${
      status === 'published'
        ? 'bg-accent-500/10 text-accent-400 border-accent-500/30'
        : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
    }`}>
      {status === 'published' ? '● Published' : '○ Draft'}
    </span>
  )

  const cats = [...new Set(quizzes.map(q => q.category).filter(Boolean))].sort()
  const filtered = quizzes.filter(q => {
    const matchSearch = !search || q.title.toLowerCase().includes(search.toLowerCase()) || q.category?.toLowerCase().includes(search.toLowerCase())
    const matchCat    = !catFilter  || q.category === catFilter
    const matchDiff   = !diffFilter || q.level === diffFilter
    return matchSearch && matchCat && matchDiff
  })

  const quizzesGrid = useMemo(() => (
    <div className="space-y-4">
      {filtered.map(q => (
        <div key={q._id} className={`glass-panel rounded-2xl group transition-all duration-300 relative overflow-hidden ${
          q.status === 'published' ? 'hover:border-accent-500/30' : 'hover:border-white/20'
        }`}>
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 group-hover:bg-primary-500/20 transition-all duration-500 z-0"></div>

          <div className="flex flex-col lg:flex-row lg:items-start gap-5 p-6 relative z-10">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h3 className="font-black text-white text-xl leading-tight group-hover:text-primary-300 transition-colors">{q.title}</h3>
                <StatusBadge status={q.status} />
                {q.category && <span className="text-[10px] bg-primary-500/10 text-primary-400 px-2.5 py-1 rounded-full font-black uppercase tracking-widest border border-primary-500/20 shadow-inner">{q.category}</span>}
              </div>
              {q.description && <p className="text-slate-400 text-sm mb-4 line-clamp-1 font-medium">{q.description}</p>}

              {/* Stats grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 mb-4">
                {[
                  ['❓', q.totalQuestions, 'Qs'],
                  ['🏆', q.totalMarks, 'Marks'],
                  ['🎯', `${q.passMarks} (${q.passPercentage}%)`, 'Pass'],
                  ['⏱️', `${q.duration}m`, 'Time'],
                  ['🔄', q.attemptsAllowed || 1, 'Attempts'],
                  ['👥', q.attemptCount || 0, 'Taken'],
                  ...(q.avgScore > 0 ? [['📈', `${q.avgScore}%`, 'Avg']] : [])
                ].map(([ic, v, l]) => (
                  <div key={l} className="bg-white/5 rounded-xl p-2 text-center border border-white/5 shadow-inner">
                    <span className="text-base">{ic}</span>
                    <p className="text-sm font-black text-white mt-0.5">{v}</p>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">{l}</p>
                  </div>
                ))}
              </div>

              {/* Level & Blueprint badges */}
              <div className="flex items-center gap-3">
                {q.level && (
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-3 py-1.5 rounded-full font-black border border-indigo-500/20 uppercase tracking-widest shadow-inner">
                    {q.level}
                  </span>
                )}
                {q.level === 'legend' && (
                  <span className="text-[10px] bg-amber-500/10 text-amber-300 px-3 py-1.5 rounded-full font-black border border-amber-500/20 shadow-inner tracking-widest">
                    📄 Includes Case Study
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-row lg:flex-col gap-3 flex-shrink-0 flex-wrap">
              <button onClick={() => togglePublish(q)}
                className={`text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all border shadow-inner ${
                  q.status === 'published'
                    ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/20'
                    : 'bg-accent-500/10 hover:bg-accent-500/20 text-accent-400 border-accent-500/30'
                }`}>
                {q.status === 'published' ? '📝 Unpublish' : '🚀 Publish'}
              </button>
              <Link to={`/admin/quizzes/${q._id}/leaderboard`}
                className="text-xs bg-primary-500/10 hover:bg-primary-500/20 text-primary-300 font-black uppercase tracking-wider px-4 py-2.5 rounded-xl border border-primary-500/20 text-center transition-colors shadow-inner">
                🏆 Leaderboard
              </Link>
              <button onClick={() => openEdit(q)}
                className="text-xs bg-white/5 hover:bg-white/10 text-slate-300 font-black uppercase tracking-wider px-4 py-2.5 rounded-xl border border-white/10 transition-colors shadow-inner">
                ✏️ Edit
              </button>
              <button onClick={() => setDelId(q._id)}
                className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 font-black uppercase tracking-wider px-4 py-2.5 rounded-xl border border-red-500/20 transition-colors shadow-inner">
                🗑 Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  ), [filtered, togglePublish, openEdit])

  if (loading) return <Layout title="Manage Quizzes"><PageLoader /></Layout>

  return (
    <Layout title="Manage Quizzes">
      <ConfirmDialog open={!!delId} onClose={() => setDelId(null)} onConfirm={deleteQuiz}
        title="Delete Quiz?" message="This removes the quiz and ALL student results permanently." confirmLabel="Delete" danger />

      {/* Edit Modal */}
      {editModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-card rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-white">Edit Quiz</h2>
              <button onClick={() => setEditModal(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5 text-slate-500 text-xl">×</button>
            </div>
            <form onSubmit={saveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-1">Title</label>
                <input value={editForm.title || ''} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                  className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-1">Description</label>
                <textarea value={editForm.description || ''} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                  rows={2} className="input-field resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-1">Pass Marks</label>
                  <input type="number" value={editForm.passMarks || 0} onChange={e => setEditForm(f => ({ ...f, passMarks: +e.target.value }))}
                    className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-1">Duration (min)</label>
                  <input type="number" value={editForm.duration || 0} onChange={e => setEditForm(f => ({ ...f, duration: +e.target.value }))}
                    className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-1">Max Attempts</label>
                  <input type="number" min={1} max={10} value={editForm.attemptsAllowed || 1} onChange={e => setEditForm(f => ({ ...f, attemptsAllowed: +e.target.value }))}
                    className="input-field" />
                </div>
                {editForm.negativeMarking && (
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-1">Neg Marks/Q</label>
                    <input type="number" step={0.25} value={editForm.negativeMarksPerQ || 0.25} onChange={e => setEditForm(f => ({ ...f, negativeMarksPerQ: +e.target.value }))}
                      className="input-field" />
                  </div>
                )}
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!editForm.negativeMarking} onChange={e => setEditForm(f => ({ ...f, negativeMarking: e.target.checked }))} className="w-4 h-4 rounded" />
                <span className="text-sm font-semibold text-slate-300">Negative Marking</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 rounded-xl text-sm disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setEditModal(null)} className="px-5 py-3 rounded-xl border border-white/10 text-sm font-semibold text-slate-300 hover:bg-white/5">Cancel</button>
              </div>
            </form>
          </div>
        </div>, document.body
      )}

      {/* Header */}
      <div className="flex flex-col mb-6 gap-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-black text-white">🧠 Quizzes</h2>
            <p className="text-slate-400 text-sm">
              {quizzes.filter(q => q.status === 'published').length} published ·{' '}
              {quizzes.filter(q => q.status === 'draft').length} drafts
            </p>
          </div>
          <Link to="/admin/quizzes/create" className="bg-primary-600 hover:bg-primary-500 text-white font-black px-5 py-2.5 rounded-xl text-sm shadow-sm transition-colors">
            + Create Quiz
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <input
            type="text"
            placeholder="🔍 Search…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field flex-1 sm:max-w-[200px]"
          />
          {cats.length > 1 && (
            <select
              value={catFilter}
              onChange={e => setCatFilter(e.target.value)}
              className="input-field flex-1 sm:max-w-[250px]"
            >
              <option value="">All Topics</option>
              {cats.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
          <select
            value={diffFilter}
            onChange={e => setDiffFilter(e.target.value)}
            className="input-field flex-1 sm:max-w-[160px]"
          >
            <option value="">All Levels</option>
            {LEVELS.map(l => <option key={l.value} value={l.value}>{l.icon} {l.label}</option>)}
          </select>
          <button
            onClick={load}
            className="btn-secondary flex-shrink-0"
            title="Refresh"
          >
            ↻
          </button>
        </div>
      </div>

      {success && <div className="mb-4 p-3 bg-accent-500/10 border border-accent-500/30 text-accent-400 rounded-xl text-sm font-semibold">{success}</div>}
      {error   && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl text-sm font-semibold">{error}</div>}

      {quizzes.length === 0 ? (
        <EmptyState icon="🧠" title="No quizzes yet"
          description="Create your first quiz. It starts as a draft — publish when ready for students."
          action={<Link to="/admin/quizzes/create" className="bg-primary-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm">+ Create Quiz</Link>} />
      ) : filtered.length === 0 ? (
        <EmptyState icon="🔍" title="No matching quizzes" description="Try adjusting your search or filters." />
      ) : (
        quizzesGrid
      )}
    </Layout>
  )
}
