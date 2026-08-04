import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import Layout from '../../components/Layout'
import { PageLoader, EmptyState, ConfirmDialog, Alert } from '../../components/UI'

export default function AdminQuizzes() {
  const [quizzes, setQuizzes]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [delId,   setDelId]     = useState(null)
  const [editModal, setEditModal] = useState(null)
  const [editForm,  setEditForm]  = useState({})
  const [saving,  setSaving]    = useState(false)
  const [success, setSuccess]   = useState('')
  const [error,   setError]     = useState('')

  const load = () => {
    setLoading(true)
    api.get('/admin/quiz')
      .then(({ data }) => setQuizzes(data.quizzes || []))
      .catch(err => setError(err.response?.data?.message || 'Failed to load quizzes'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const toast = (msg, isErr = false) => {
    if (isErr) setError(msg); else setSuccess(msg)
    setTimeout(() => { setSuccess(''); setError('') }, 3500)
  }

  // ISSUE 4 FIX: publish/unpublish toggle
  const togglePublish = async (q) => {
    try {
      const { data } = await api.patch(`/admin/quiz/${q._id}/publish`)
      toast(data.message)
      load()
    } catch (err) {
      toast(err.response?.data?.message || 'Failed', true)
    }
  }

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

  const openEdit = (q) => {
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
  }

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

  if (loading) return <Layout title="Manage Quizzes"><PageLoader /></Layout>

  return (
    <Layout title="Manage Quizzes">
      <ConfirmDialog open={!!delId} onClose={() => setDelId(null)} onConfirm={deleteQuiz}
        title="Delete Quiz?" message="This removes the quiz and ALL student results permanently." confirmLabel="Delete" danger />

      {/* Edit Modal */}
      {editModal && (
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
                  className="w-full border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-1">Description</label>
                <textarea value={editForm.description || ''} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                  rows={2} className="w-full border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-1">Pass Marks</label>
                  <input type="number" value={editForm.passMarks || 0} onChange={e => setEditForm(f => ({ ...f, passMarks: +e.target.value }))}
                    className="w-full border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-1">Duration (min)</label>
                  <input type="number" value={editForm.duration || 0} onChange={e => setEditForm(f => ({ ...f, duration: +e.target.value }))}
                    className="w-full border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-1">Max Attempts</label>
                  <input type="number" min={1} max={10} value={editForm.attemptsAllowed || 1} onChange={e => setEditForm(f => ({ ...f, attemptsAllowed: +e.target.value }))}
                    className="w-full border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                {editForm.negativeMarking && (
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-1">Neg Marks/Q</label>
                    <input type="number" step={0.25} value={editForm.negativeMarksPerQ || 0.25} onChange={e => setEditForm(f => ({ ...f, negativeMarksPerQ: +e.target.value }))}
                      className="w-full border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
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
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
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

      {success && <div className="mb-4 p-3 bg-accent-500/10 border border-accent-500/30 text-accent-400 rounded-xl text-sm font-semibold">{success}</div>}
      {error   && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl text-sm font-semibold">{error}</div>}

      {quizzes.length === 0 ? (
        <EmptyState icon="🧠" title="No quizzes yet"
          description="Create your first quiz. It starts as a draft — publish when ready for students."
          action={<Link to="/admin/quizzes/create" className="bg-primary-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm">+ Create Quiz</Link>} />
      ) : (
        <div className="space-y-4">
          {quizzes.map(q => (
            <div key={q._id} className={`bg-surface-card rounded-2xl border shadow-sm p-5 hover:shadow-md transition-shadow ${
              q.status === 'published' ? 'border-accent-500/20' : 'border-white/10'
            }`}>
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-black text-white text-lg leading-tight">{q.title}</h3>
                    <StatusBadge status={q.status} />
                    {q.category && <span className="text-xs bg-primary-500/10 text-primary-400 px-2.5 py-1 rounded-full font-semibold border border-primary-500/20">{q.category}</span>}
                  </div>
                  {q.description && <p className="text-slate-400 text-sm mb-3 line-clamp-1">{q.description}</p>}

                  {/* Stats row */}
                  <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-slate-400 mb-3">
                    <span>❓ <strong>{q.totalQuestions}</strong> questions</span>
                    <span>🏆 <strong>{q.totalMarks}</strong> marks</span>
                    <span>🎯 Pass: <strong>{q.passMarks} ({q.passPercentage}%)</strong></span>
                    <span>⏱️ <strong>{q.duration}m</strong></span>
                    <span>🔄 <strong>{q.attemptsAllowed || 1}</strong> attempt{(q.attemptsAllowed||1)>1?'s':''}</span>
                    <span>👥 <strong>{q.attemptCount || 0}</strong> submitted</span>
                    {q.avgScore > 0 && <span>📈 Avg: <strong>{q.avgScore}%</strong></span>}
                  </div>

                  {/* Difficulty ratio bar */}
                  <div className="flex items-center gap-3">
                    <div className="flex rounded-lg overflow-hidden h-2.5 flex-1 max-w-[200px] bg-white/5">
                      {q.difficultyRatio?.easy   > 0 && <div className="bg-accent-400" style={{ width: `${q.difficultyRatio.easy}%` }} title={`Easy ${q.difficultyRatio.easy}%`} />}
                      {q.difficultyRatio?.medium > 0 && <div className="bg-amber-400"   style={{ width: `${q.difficultyRatio.medium}%` }} title={`Medium ${q.difficultyRatio.medium}%`} />}
                      {q.difficultyRatio?.hard   > 0 && <div className="bg-red-400"     style={{ width: `${q.difficultyRatio.hard}%` }} title={`Hard ${q.difficultyRatio.hard}%`} />}
                    </div>
                    <div className="flex gap-3 text-xs text-slate-500">
                      <span><span className="text-emerald-500 font-bold">●</span> {q.difficultyRatio?.easy}%E</span>
                      <span><span className="text-amber-500 font-bold">●</span> {q.difficultyRatio?.medium}%M</span>
                      <span><span className="text-red-400 font-bold">●</span> {q.difficultyRatio?.hard}%H</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-row lg:flex-col gap-2 flex-shrink-0 flex-wrap">
                  {/* ISSUE 4 FIX: Publish/Unpublish button */}
                  <button onClick={() => togglePublish(q)}
                    className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all border ${
                      q.status === 'published'
                        ? 'bg-amber-500/10 hover:bg-amber-500/15 text-amber-300 border-amber-500/20'
                        : 'bg-accent-500/10 hover:bg-accent-500/15 text-accent-400 border-accent-500/30'
                    }`}>
                    {q.status === 'published' ? '📝 Unpublish' : '🚀 Publish'}
                  </button>
                  <Link to={`/admin/quizzes/${q._id}/leaderboard`}
                    className="text-xs bg-primary-500/10 hover:bg-primary-500/20 text-primary-300 font-bold px-4 py-2.5 rounded-xl border border-primary-500/20 text-center transition-colors">
                    🏆 Leaderboard
                  </Link>
                  <button onClick={() => openEdit(q)}
                    className="text-xs bg-white/5 hover:bg-white/5 text-slate-300 font-bold px-4 py-2.5 rounded-xl border border-white/10 transition-colors">
                    ✏️ Edit
                  </button>
                  <button onClick={() => setDelId(q._id)}
                    className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold px-4 py-2.5 rounded-xl border border-red-500/20 transition-colors">
                    🗑 Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
