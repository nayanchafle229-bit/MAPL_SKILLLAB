import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import Layout from '../../components/Layout'
import './AdminQuizzes.css'

/* ══════════════════════════════════════════════════════════════
   Admin Quizzes — Quiz Management
   MAPL SkillLab · PLC / DCS / SCADA / Industrial Automation LMS

   Notes on this rewrite:
   - Subcomponents are now declared OUTSIDE the main component so
     they keep a stable identity across renders (the previous
     version redefined them on every render, which forces React to
     remount them and is a common source of flicker / lost focus).
   - Toast, ConfirmDialog, EmptyState and the loading state are now
     self-contained in this file instead of pulled from
     '../../components/UI'. That removes a dependency this screen
     doesn't control — if that module ever breaks, it no longer
     takes this page down with it (a very common cause of the
     "blank page, error only in console" symptom).
   - CSS classes below are all actually used (see AdminQuizzes.css).
   ══════════════════════════════════════════════════════════════ */

/* ── Icons (inline, no external icon package required) ───────── */
const Icon = {
  Quiz: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  Check: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Draft: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Question: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
    </svg>
  ),
  Plus: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Trophy: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Trash: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Search: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
    </svg>
  ),
  Close: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Chevron: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  Warn: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  ),
  Shield: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M12 3C7.029 3 3 6.582 3 11c0 2.608 1.408 4.926 3.6 6.372L6 21l3.364-1.682A10.68 10.68 0 0012 19c4.971 0 9-3.582 9-8S16.971 3 12 3z" />
    </svg>
  ),
}

/* ── Formatting helpers ───────────────────────────────────────── */
const fmtDate = (d) => {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return '—'
  }
}

/* ── Status pill ──────────────────────────────────────────────── */
function StatusPill({ status }) {
  const published = status === 'published'
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase px-3 py-1 rounded-full ${
        published
          ? 'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20'
          : 'bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${published ? 'bg-emerald-500 status-dot-pulse' : 'bg-amber-500'}`} />
      {published ? 'Published' : 'Draft'}
    </span>
  )
}

/* ── KPI stat card (header row) ──────────────────────────────── */
function StatCard({ icon, value, label, tone }) {
  const tones = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
  }
  return (
    <div className="quiz-card-hover bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${tones[tone]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
        <p className="text-xs text-gray-400 font-medium truncate">{label}</p>
      </div>
    </div>
  )
}

/* ── Inline stat chip (inside a quiz row) ────────────────────── */
function StatChip({ label, value }) {
  return (
    <div className="flex items-center gap-1.5 text-gray-500">
      <span className="text-xs font-medium">{label}:</span>
      <span className="text-xs font-bold text-gray-800">{value}</span>
    </div>
  )
}

/* ── Difficulty distribution bar ─────────────────────────────── */
function DifficultyBar({ ratio }) {
  const easy = ratio?.easy || 0
  const medium = ratio?.medium || 0
  const hard = ratio?.hard || 0
  const total = easy + medium + hard || 1

  return (
    <div className="flex items-center gap-3">
      <div className="flex rounded-full overflow-hidden h-1.5 flex-1 max-w-[140px] bg-gray-100 ring-1 ring-gray-200/50">
        {easy > 0 && <div className="diff-segment bg-emerald-400" style={{ width: `${(easy / total) * 100}%` }} />}
        {medium > 0 && <div className="diff-segment bg-amber-400" style={{ width: `${(medium / total) * 100}%` }} />}
        {hard > 0 && <div className="diff-segment bg-rose-400" style={{ width: `${(hard / total) * 100}%` }} />}
      </div>
      <div className="flex gap-3 text-[10px] text-gray-400 font-medium tracking-wide">
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />E{easy}</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" />M{medium}</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-400" />H{hard}</span>
      </div>
    </div>
  )
}

/* ── Small square action button ──────────────────────────────── */
function ActionBtn({ onClick, variant, title, children, as: As = 'button', to }) {
  const styles = {
    success: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 ring-emerald-500/10',
    warning: 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 ring-amber-500/10',
    danger: 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 ring-rose-500/10',
    neutral: 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20 ring-gray-500/10',
    blue: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 ring-blue-500/10',
  }
  const cls = `inline-flex items-center justify-center w-9 h-9 rounded-xl transition-colors ring-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${styles[variant]}`
  if (As === Link) {
    return (
      <Link to={to} title={title} className={cls}>
        {children}
      </Link>
    )
  }
  return (
    <button type="button" onClick={onClick} title={title} aria-label={title} className={cls}>
      {children}
    </button>
  )
}

/* ── Form field wrapper ──────────────────────────────────────── */
function FormField({ label, required, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
        {label}
        {required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

const inputClass =
  'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all'

/* ── Toggle switch ────────────────────────────────────────────── */
function Toggle({ checked, onChange, icon, label, description }) {
  return (
    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer select-none">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${checked ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
          {icon}
        </div>
        <div>
          <span className="text-sm font-semibold text-gray-800">{label}</span>
          {description && <p className="text-[11px] text-gray-400 mt-0.5">{description}</p>}
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1 ${checked ? 'bg-indigo-500' : 'bg-gray-300'}`}
      >
        <span className={`toggle-knob absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm block ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </label>
  )
}

/* ── Toast stack (self-contained, no external UI dependency) ─── */
function ToastStack({ toasts, onDismiss }) {
  if (!toasts.length) return null
  return (
    <div className="fixed top-5 right-5 z-[70] flex flex-col gap-2 w-[min(360px,calc(100vw-2.5rem))]">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast-animate relative overflow-hidden rounded-xl shadow-lg ring-1 bg-white pl-4 pr-9 py-3 flex items-start gap-2.5 ${
            t.type === 'error' ? 'ring-rose-200' : 'ring-emerald-200'
          }`}
        >
          <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${t.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
          <p className="text-sm font-medium text-gray-800 leading-snug">{t.message}</p>
          <button
            onClick={() => onDismiss(t.id)}
            className="absolute top-2.5 right-2.5 text-gray-300 hover:text-gray-500 transition-colors"
            aria-label="Dismiss notification"
          >
            <Icon.Close className="w-3.5 h-3.5" />
          </button>
          <span className={`toast-progress-bar absolute bottom-0 left-0 h-0.5 w-full ${t.type === 'error' ? 'bg-rose-400' : 'bg-emerald-400'}`} />
        </div>
      ))}
    </div>
  )
}

/* ── Confirm dialog (self-contained) ─────────────────────────── */
function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', danger, busy, onConfirm, onClose }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="modal-backdrop absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="modal-content relative bg-white rounded-2xl shadow-2xl ring-1 ring-gray-200/60 w-full max-w-sm p-6">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${danger ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
          <Icon.Warn className="w-5 h-5" />
        </div>
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{message}</p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onConfirm}
            disabled={busy}
            className={`flex-1 font-semibold py-2.5 rounded-xl text-sm shadow-md disabled:opacity-50 transition-colors ${
              danger ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
            }`}
          >
            {busy ? 'Please wait…' : confirmLabel}
          </button>
          <button onClick={onClose} disabled={busy} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Empty state ──────────────────────────────────────────────── */
function EmptyState({ title, description, action }) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 px-6 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mb-4">
        <Icon.Question className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-400 mt-1.5 max-w-sm leading-relaxed">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/* ── Loading skeleton (replaces spinner-only loader) ─────────── */
function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="skeleton-shimmer rounded-2xl h-40 mb-6" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton-shimmer rounded-2xl h-[76px]" />
        ))}
      </div>
      <div className="skeleton-shimmer rounded-xl h-10 w-72 mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton-shimmer rounded-2xl h-[132px]" />
        ))}
      </div>
    </div>
  )
}

/* ── A single quiz row ────────────────────────────────────────── */
function QuizRow({ quiz: q, onTogglePublish, onEdit, onDelete }) {
  return (
    <div
      className={`group quiz-card-hover bg-white rounded-2xl border shadow-sm ${
        q.status === 'published' ? 'border-emerald-100' : 'border-gray-100'
      }`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="font-bold text-gray-900 text-base tracking-tight truncate">{q.title}</h3>
              <StatusPill status={q.status} />
              {q.category && (
                <span className="inline-flex items-center text-[11px] font-semibold text-indigo-600 bg-indigo-500/10 px-2.5 py-1 rounded-lg ring-1 ring-indigo-500/10">
                  {q.category}
                </span>
              )}
            </div>
            {q.description && <p className="text-xs text-gray-400 mt-1.5 line-clamp-1 leading-relaxed">{q.description}</p>}
            {q.updatedAt && <p className="text-[11px] text-gray-300 mt-1">Last updated {fmtDate(q.updatedAt)}</p>}
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <ActionBtn onClick={() => onTogglePublish(q)} variant={q.status === 'published' ? 'warning' : 'success'} title={q.status === 'published' ? 'Unpublish' : 'Publish'}>
              {q.status === 'published' ? <Icon.Draft className="w-4 h-4" /> : <Icon.Check className="w-4 h-4" />}
            </ActionBtn>
            <ActionBtn onClick={() => onEdit(q)} variant="neutral" title="Edit">
              <Icon.Draft className="w-4 h-4" />
            </ActionBtn>
            <ActionBtn as={Link} to={`/admin/quizzes/${q._id}/leaderboard`} variant="blue" title="Leaderboard">
              <Icon.Trophy className="w-4 h-4" />
            </ActionBtn>
            <ActionBtn onClick={() => onDelete(q._id)} variant="danger" title="Delete">
              <Icon.Trash className="w-4 h-4" />
            </ActionBtn>
          </div>
        </div>

        <div className="border-t border-gray-100 my-3" />

        <div className="flex flex-wrap items-center justify-between gap-y-3">
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <StatChip label="Questions" value={q.totalQuestions} />
            <StatChip label="Marks" value={q.totalMarks} />
            <StatChip label="Pass" value={`${q.passMarks} (${q.passPercentage}%)`} />
            <StatChip label="Duration" value={`${q.duration}m`} />
            <StatChip label="Attempts" value={q.attemptsAllowed || 1} />
            <StatChip label="Submitted" value={q.attemptCount || 0} />
            {q.avgScore > 0 && <StatChip label="Avg Score" value={`${q.avgScore}%`} />}
          </div>
          <DifficultyBar ratio={q.difficultyRatio} />
        </div>
      </div>
    </div>
  )
}

/* ── Edit quiz modal ──────────────────────────────────────────── */
function EditQuizModal({ quiz, form, setForm, saving, onSave, onClose }) {
  if (!quiz) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="modal-backdrop absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="modal-content relative bg-white rounded-3xl shadow-2xl ring-1 ring-gray-200/60 w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-gray-100">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Edit Quiz</h2>
            <p className="text-xs text-gray-400 mt-0.5 truncate">{quiz.title}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close">
            <Icon.Close className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSave} className="quiz-scroll p-7 space-y-5 overflow-y-auto max-h-[calc(90vh-8rem)]">
          <FormField label="Title" required>
            <input
              value={form.title || ''}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className={inputClass}
              required
              placeholder="Quiz title"
            />
          </FormField>

          <FormField label="Description">
            <textarea
              value={form.description || ''}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className={`${inputClass} resize-none`}
              placeholder="Brief description…"
            />
          </FormField>

          <div className="grid grid-cols-3 gap-3">
            <FormField label="Pass Marks">
              <input type="number" min={0} value={form.passMarks ?? 0} onChange={(e) => setForm((f) => ({ ...f, passMarks: +e.target.value }))} className={inputClass} />
            </FormField>
            <FormField label="Duration (min)">
              <input type="number" min={0} value={form.duration ?? 0} onChange={(e) => setForm((f) => ({ ...f, duration: +e.target.value }))} className={inputClass} />
            </FormField>
            <FormField label="Max Attempts">
              <input type="number" min={1} max={10} value={form.attemptsAllowed ?? 1} onChange={(e) => setForm((f) => ({ ...f, attemptsAllowed: +e.target.value }))} className={inputClass} />
            </FormField>
          </div>

          {form.negativeMarking && (
            <FormField label="Negative Marks / Question">
              <input
                type="number"
                step={0.25}
                min={0}
                value={form.negativeMarksPerQ ?? 0.25}
                onChange={(e) => setForm((f) => ({ ...f, negativeMarksPerQ: +e.target.value }))}
                className={inputClass}
              />
            </FormField>
          )}

          <Toggle
            checked={!!form.negativeMarking}
            onChange={(v) => setForm((f) => ({ ...f, negativeMarking: v }))}
            icon={<Icon.Shield className="w-5 h-5" />}
            label="Negative Marking"
            description="Deduct marks for wrong answers"
          />

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl text-sm shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Main component
   ══════════════════════════════════════════════════════════════ */
export default function AdminQuizzes() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [delId, setDelId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const [editModal, setEditModal] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)

  const [toasts, setToasts] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')

  /* ── Data loading ────────────────────────────────────────────── */
  const load = useCallback(() => {
    setLoading(true)
    setLoadError('')
    api
      .get('/admin/quiz')
      .then(({ data }) => setQuizzes(data.quizzes || []))
      .catch((err) => setLoadError(err.response?.data?.message || 'Failed to load quizzes. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  /* ── Toasts ──────────────────────────────────────────────────── */
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }, [])
  const dismissToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  /* ── Actions ─────────────────────────────────────────────────── */
  const togglePublish = useCallback(
    async (q) => {
      try {
        const { data } = await api.patch(`/admin/quiz/${q._id}/publish`)
        showToast(data.message || `Quiz ${q.status === 'published' ? 'unpublished' : 'published'}`)
        load()
      } catch (err) {
        showToast(err.response?.data?.message || 'Failed to update quiz status', 'error')
      }
    },
    [load, showToast]
  )

  const deleteQuiz = useCallback(async () => {
    setDeleting(true)
    try {
      await api.delete(`/admin/quiz/${delId}`)
      setDelId(null)
      showToast('Quiz deleted')
      load()
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'error')
    } finally {
      setDeleting(false)
    }
  }, [delId, load, showToast])

  const openEdit = useCallback((q) => {
    setEditForm({
      title: q.title,
      description: q.description || '',
      passMarks: q.passMarks,
      duration: q.duration,
      attemptsAllowed: q.attemptsAllowed || 1,
      negativeMarking: q.negativeMarking || false,
      negativeMarksPerQ: q.negativeMarksPerQ || 0.25,
    })
    setEditModal(q)
  }, [])

  const saveEdit = useCallback(
    async (e) => {
      e.preventDefault()
      setSaving(true)
      try {
        await api.put(`/admin/quiz/${editModal._id}`, editForm)
        setEditModal(null)
        showToast('Quiz updated')
        load()
      } catch (err) {
        showToast(err.response?.data?.message || 'Update failed', 'error')
      } finally {
        setSaving(false)
      }
    },
    [editModal, editForm, load, showToast]
  )

  /* ── Derived data ────────────────────────────────────────────── */
  const publishedCount = useMemo(() => quizzes.filter((q) => q.status === 'published').length, [quizzes])
  const draftCount = useMemo(() => quizzes.filter((q) => q.status === 'draft').length, [quizzes])
  const totalQuestions = useMemo(() => quizzes.reduce((s, q) => s + (q.totalQuestions || 0), 0), [quizzes])

  const visibleQuizzes = useMemo(() => {
    let list = filter === 'all' ? quizzes : quizzes.filter((q) => q.status === filter)

    if (search.trim()) {
      const term = search.trim().toLowerCase()
      list = list.filter((q) => q.title?.toLowerCase().includes(term) || q.category?.toLowerCase().includes(term))
    }

    const sorted = [...list]
    if (sort === 'newest') sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    else if (sort === 'oldest') sorted.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
    else if (sort === 'az') sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
    else if (sort === 'attempts') sorted.sort((a, b) => (b.attemptCount || 0) - (a.attemptCount || 0))
    return sorted
  }, [quizzes, filter, search, sort])

  /* ── Render ──────────────────────────────────────────────────── */
  if (loading) {
    return (
      <Layout title="Quiz Management">
        <LoadingSkeleton />
      </Layout>
    )
  }

  return (
    <Layout title="Quiz Management">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <ConfirmDialog
        open={!!delId}
        busy={deleting}
        onClose={() => !deleting && setDelId(null)}
        onConfirm={deleteQuiz}
        title="Delete this quiz?"
        message="This removes the quiz and ALL student results permanently. This action can't be undone."
        confirmLabel="Delete quiz"
        danger
      />

      <EditQuizModal quiz={editModal} form={editForm} setForm={setEditForm} saving={saving} onSave={saveEdit} onClose={() => setEditModal(null)} />

      {/* ── Page header ──────────────────────────────────────── */}
      <section className="admin-hero-glow relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 p-6 lg:p-8 mb-6">
        <div className="admin-hero-circuit" />
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-semibold text-white/90 mb-3">
              <Icon.Shield className="w-3.5 h-3.5" />
              MAPL SkillLab Admin
            </span>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">Quiz Management</h1>
            <p className="text-indigo-100 mt-2 text-sm max-w-xl">
              Create, publish and manage engineering quizzes for PLC, DCS, SCADA, Instrumentation and Industrial Automation training programs.
            </p>
          </div>
          <Link
            to="/admin/quizzes/create"
            className="inline-flex items-center gap-2 px-5 py-3 bg-white text-indigo-700 font-semibold text-sm rounded-xl hover:bg-indigo-50 transition-colors shadow-lg shadow-black/10 flex-shrink-0"
          >
            <Icon.Plus className="w-4 h-4" />
            Create Quiz
          </Link>
        </div>
      </section>

      {/* ── Summary stats ────────────────────────────────────── */}
      <div className="hero-stats-grid grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<Icon.Quiz className="w-5 h-5" />} value={quizzes.length} label="Total Quizzes" tone="indigo" />
        <StatCard icon={<Icon.Check className="w-5 h-5" />} value={publishedCount} label="Published" tone="emerald" />
        <StatCard icon={<Icon.Draft className="w-5 h-5" />} value={draftCount} label="Drafts" tone="amber" />
        <StatCard icon={<Icon.Question className="w-5 h-5" />} value={totalQuestions} label="Total Questions" tone="purple" />
      </div>

      {loadError && (
        <div className="flex items-center justify-between gap-3 bg-rose-50 border border-rose-100 text-rose-700 text-sm rounded-xl px-4 py-3 mb-6">
          <span className="flex items-center gap-2">
            <Icon.Warn className="w-4 h-4 flex-shrink-0" />
            {loadError}
          </span>
          <button onClick={load} className="font-semibold underline hover:no-underline flex-shrink-0">
            Retry
          </button>
        </div>
      )}

      {/* ── Toolbar: filters, search, sort ──────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-6">
        <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl w-fit">
          {[
            { key: 'all', label: 'All', count: quizzes.length },
            { key: 'published', label: 'Published', count: publishedCount },
            { key: 'draft', label: 'Drafts', count: draftCount },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                filter === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${filter === tab.key ? 'bg-gray-100 text-gray-500' : 'bg-gray-200/60 text-gray-400'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Icon.Search className="w-4 h-4 text-gray-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or category…"
              className="w-64 pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all"
            />
          </div>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none pl-4 pr-9 py-2.5 text-sm font-medium rounded-xl border border-gray-200 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all cursor-pointer"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="az">Title A–Z</option>
              <option value="attempts">Most attempted</option>
            </select>
            <Icon.Chevron className="w-3.5 h-3.5 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── Quiz list ────────────────────────────────────────── */}
      {visibleQuizzes.length === 0 ? (
        <EmptyState
          title={search ? 'No matching quizzes' : filter === 'all' ? 'No quizzes yet' : `No ${filter} quizzes`}
          description={
            search
              ? `Nothing matches "${search}". Try a different search term.`
              : filter === 'all'
              ? 'Create your first quiz. It starts as a draft — publish when ready for students.'
              : 'Change the filter to view other quizzes.'
          }
          action={
            search ? (
              <button onClick={() => setSearch('')} className="text-indigo-600 font-semibold text-sm hover:underline">
                Clear search
              </button>
            ) : filter === 'all' ? (
              <Link to="/admin/quizzes/create" className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-md shadow-indigo-500/20 hover:bg-indigo-700 transition-colors">
                <Icon.Plus className="w-4 h-4" />
                Create Quiz
              </Link>
            ) : (
              <button onClick={() => setFilter('all')} className="text-indigo-600 font-semibold text-sm hover:underline">
                View all quizzes
              </button>
            )
          }
        />
      ) : (
        <div className="space-y-3">
          {visibleQuizzes.map((q) => (
            <QuizRow key={q._id} quiz={q} onTogglePublish={togglePublish} onEdit={openEdit} onDelete={setDelId} />
          ))}
        </div>
      )}
    </Layout>
  )
}
