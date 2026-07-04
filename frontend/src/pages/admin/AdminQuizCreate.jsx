/**
 * AdminQuizCreate.jsx — Production-ready quiz creation form
 *
 * ROOT CAUSE OF BUG (fixed here):
 *   The original `InputField` was defined INSIDE the component function body.
 *   On every state change React sees a brand-new component type → unmounts the
 *   old <input>, mounts a fresh one → focus is lost after every keystroke.
 *
 * FIXES APPLIED:
 *   1. ALL sub-components (InputField, TextAreaField, NumberField, CheckToggle)
 *      moved OUTSIDE the parent component — stable identity across renders.
 *   2. State handlers stabilised with useCallback — no new function references.
 *   3. Derived values (ratioSum, counts, canCreate) wrapped in useMemo.
 *   4. Heavy sub-sections wrapped in React.memo so they only re-render when
 *      their specific slice of state changes.
 *   5. Input styling fixed: proper width, padding, word-wrap, overflow.
 *   6. Textarea auto-resizes on input.
 */

import React, {
  useState, useEffect, useCallback, useMemo, useRef, memo,
} from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import Layout from '../../components/Layout'

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS  (module scope — never recreated)
// ─────────────────────────────────────────────────────────────────────────────
const CATS  = ['General','JavaScript','React','Node.js','MongoDB','Python','MySQL','Web','Database','Other']
const DIFFS = [
  { key:'easy',   label:'Easy %',   bar:'bg-emerald-500', border:'border-emerald-300', light:'bg-emerald-50' },
  { key:'medium', label:'Medium %', bar:'bg-amber-500',   border:'border-amber-300',   light:'bg-amber-50'   },
  { key:'hard',   label:'Hard %',   bar:'bg-red-500',     border:'border-red-300',     light:'bg-red-50'     },
]

const INPUT_CLS = [
  'w-full min-w-0',
  'border border-gray-200 rounded-xl',
  'px-4 py-2.5',
  'text-sm text-gray-900',
  'bg-white',
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
  'placeholder:text-gray-400',
  'transition-shadow duration-150',
  'leading-normal',
  // overflow fix
  'overflow-hidden text-ellipsis',
].join(' ')

const LABEL_CLS = 'block text-sm font-bold text-gray-700 mb-1.5 leading-tight'

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVE INPUT COMPONENTS  (defined at module level — NEVER inside render)
// ─────────────────────────────────────────────────────────────────────────────

/** Plain text / number input */
const InputField = memo(function InputField({
  label, name, type = 'text', value, onChange,
  min, max, step, placeholder, required, hint,
  autoFocus,
}) {
  return (
    <div className="flex flex-col min-w-0">
      <label htmlFor={name} className={LABEL_CLS}>
        {label}
        {required && <span className="text-red-500 ml-0.5" aria-hidden>*</span>}
      </label>
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        required={required}
        autoFocus={autoFocus}
        className={INPUT_CLS}
        autoComplete="off"
      />
      {hint && <p className="text-xs text-gray-400 mt-1 leading-snug">{hint}</p>}
    </div>
  )
})

/** Auto-growing textarea */
const TextAreaField = memo(function TextAreaField({
  label, name, value, onChange, placeholder, rows = 3, required, hint,
}) {
  const ref = useRef(null)

  // Auto-resize on content change
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  return (
    <div className="flex flex-col min-w-0">
      <label htmlFor={name} className={LABEL_CLS}>
        {label}
        {required && <span className="text-red-500 ml-0.5" aria-hidden>*</span>}
      </label>
      <textarea
        id={name}
        ref={ref}
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        required={required}
        className={[
          INPUT_CLS,
          'resize-none overflow-hidden',
          'whitespace-pre-wrap break-words',
        ].join(' ')}
        style={{ minHeight: `${rows * 1.6}rem` }}
      />
      {hint && <p className="text-xs text-gray-400 mt-1 leading-snug">{hint}</p>}
    </div>
  )
})

/** Checkbox toggle with label + description */
const CheckToggle = memo(function CheckToggle({ name, label, desc, checked, onChange }) {
  return (
    <label
      htmlFor={`chk-${name}`}
      className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 transition-colors select-none"
    >
      <input
        id={`chk-${name}`}
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="mt-0.5 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 flex-shrink-0 cursor-pointer"
      />
      <div className="min-w-0">
        <p className="text-sm font-bold text-gray-800 leading-tight">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5 leading-snug">{desc}</p>
      </div>
    </label>
  )
})

/** Difficulty ratio input card */
const DiffRatioCard = memo(function DiffRatioCard({
  diffKey, label, bar, border, light,
  value, onChange,
  count, avail,
}) {
  const short = avail < count
  return (
    <div className={`border-2 rounded-xl p-4 transition-colors ${short ? `${border} ${light}` : 'border-gray-200 bg-white'}`}>
      <label htmlFor={`ratio-${diffKey}`} className={LABEL_CLS}>{label}</label>
      <input
        id={`ratio-${diffKey}`}
        type="number"
        name={diffKey}
        value={value}
        onChange={onChange}
        min={0}
        max={100}
        className={[INPUT_CLS, 'mb-2'].join(' ')}
      />
      <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden mb-2">
        <div
          className={`h-full ${bar} rounded-full transition-all duration-300`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
      <p className={`text-xs font-semibold leading-snug ${short ? 'text-red-600' : 'text-gray-500'}`}>
        Needs <strong>{count}</strong> questions
        <span className={`ml-1 font-black ${short ? 'text-red-600' : 'text-emerald-600'}`}>
          ({avail} in DB)
        </span>
      </p>
    </div>
  )
})

// ─────────────────────────────────────────────────────────────────────────────
// SECTION WRAPPERS  (memoised — only re-render when their props change)
// ─────────────────────────────────────────────────────────────────────────────

const SectionCard = memo(function SectionCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-5">{title}</h3>
      {children}
    </div>
  )
})

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminQuizCreate() {
  const navigate = useNavigate()

  // ── Form state ────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    title:           '',
    description:     '',
    totalQuestions:  40,
    totalMarks:      40,
    passMarks:       24,
    duration:        60,
    category:        'General',
    difficultyRatio: { easy: 40, medium: 40, hard: 20 },
    negativeMarking:   false,
    negativeMarksPerQ: 0.25,
    shuffleQuestions:  true,
    shuffleOptions:    true,
    attemptsAllowed:   1,
  })

  const [qCounts, setQCounts] = useState({ easy: 0, medium: 0, hard: 0 })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  // Fetch live counts once
  useEffect(() => {
    api.get('/question')
      .then(({ data }) => {
        const qs = data.questions || []
        setQCounts({
          easy:   qs.filter(q => q.difficulty === 'easy').length,
          medium: qs.filter(q => q.difficulty === 'medium').length,
          hard:   qs.filter(q => q.difficulty === 'hard').length,
        })
      })
      .catch(() => {})
  }, [])

  // ── Stable handlers (useCallback → same reference every render) ───────────
  const handleField = useCallback((e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox'
        ? checked
        : type === 'number'
          ? (value === '' ? '' : parseFloat(value) || 0)
          : value,
    }))
  }, [])

  const handleRatio = useCallback((e) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      difficultyRatio: {
        ...prev.difficultyRatio,
        [name]: value === '' ? '' : parseFloat(value) || 0,
      },
    }))
  }, [])

  // ── Derived values (useMemo → recalculate only when relevant state changes)
  const ratioSum = useMemo(() =>
    (Number(form.difficultyRatio.easy)   || 0) +
    (Number(form.difficultyRatio.medium) || 0) +
    (Number(form.difficultyRatio.hard)   || 0),
  [form.difficultyRatio])

  const counts = useMemo(() => {
    const tq  = Number(form.totalQuestions) || 0
    const e   = Math.round(((Number(form.difficultyRatio.easy)   || 0) / 100) * tq)
    const m   = Math.round(((Number(form.difficultyRatio.medium) || 0) / 100) * tq)
    const h   = tq - e - m
    return { easy: e, medium: m, hard: h }
  }, [form.difficultyRatio, form.totalQuestions])

  const passPercentage = useMemo(() => {
    const tm = Number(form.totalMarks) || 0
    const pm = Number(form.passMarks)  || 0
    return tm > 0 ? ((pm / tm) * 100).toFixed(1) : '0'
  }, [form.totalMarks, form.passMarks])

  const validationErrors = useMemo(() => {
    const errs = []
    if (ratioSum !== 100)
      errs.push(`Difficulty ratios must sum to 100% (currently ${ratioSum}%)`)
    if (counts.easy   > qCounts.easy)
      errs.push(`Need ${counts.easy} easy questions — only ${qCounts.easy} available`)
    if (counts.medium > qCounts.medium)
      errs.push(`Need ${counts.medium} medium questions — only ${qCounts.medium} available`)
    if (counts.hard   > qCounts.hard)
      errs.push(`Need ${counts.hard} hard questions — only ${qCounts.hard} available`)
    if (!form.title.trim())
      errs.push('Quiz title is required')
    if (Number(form.totalQuestions) < 1)
      errs.push('Total questions must be at least 1')
    if (Number(form.totalMarks) < 1)
      errs.push('Total marks must be at least 1')
    if (Number(form.passMarks) > Number(form.totalMarks))
      errs.push('Pass marks cannot exceed total marks')
    return errs
  }, [ratioSum, counts, qCounts, form.title, form.totalQuestions, form.totalMarks, form.passMarks])

  const canCreate = validationErrors.length === 0

  // ── Submit ─────────────────────────────────────────────────────────────────
  const submit = useCallback(async (e) => {
    e.preventDefault()
    setError('')
    if (!canCreate) {
      setError(validationErrors[0])
      return
    }
    setLoading(true)
    try {
      await api.post('/admin/quiz', {
        title:           form.title.trim(),
        description:     form.description.trim(),
        totalQuestions:  Number(form.totalQuestions),
        totalMarks:      Number(form.totalMarks),
        passMarks:       Number(form.passMarks),
        duration:        Number(form.duration),
        category:        form.category,
        difficultyRatio: {
          easy:   Number(form.difficultyRatio.easy),
          medium: Number(form.difficultyRatio.medium),
          hard:   Number(form.difficultyRatio.hard),
        },
        negativeMarking:   form.negativeMarking,
        negativeMarksPerQ: Number(form.negativeMarksPerQ),
        shuffleQuestions:  form.shuffleQuestions,
        shuffleOptions:    form.shuffleOptions,
        attemptsAllowed:   Number(form.attemptsAllowed),
      })
      navigate('/admin/quizzes')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create quiz')
    } finally {
      setLoading(false)
    }
  }, [canCreate, validationErrors, form, navigate])

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Layout title="Create Quiz">
      <div className="max-w-3xl mx-auto pb-10">

        {/* Page header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-gray-900 leading-tight">🧠 Create New Quiz</h2>
            <p className="text-gray-500 text-sm mt-1">
              Configure difficulty ratios — the system auto-selects questions from the bank.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/admin/quizzes')}
            className="flex-shrink-0 text-sm text-gray-500 hover:text-gray-800 font-semibold transition-colors"
          >
            ← Back
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5" noValidate>

          {/* ── 1. Basic Info ─────────────────────────────────────────────── */}
          <SectionCard title="📝 Basic Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div className="sm:col-span-2">
                <InputField
                  label="Quiz Title"
                  name="title"
                  value={form.title}
                  onChange={handleField}
                  placeholder="e.g. MySQL Fundamentals Assessment"
                  required
                  autoFocus
                />
              </div>

              <div className="sm:col-span-2">
                <TextAreaField
                  label="Description"
                  name="description"
                  value={form.description}
                  onChange={handleField}
                  placeholder="Brief description shown to students before they start…"
                  rows={2}
                />
              </div>

              <div>
                <label htmlFor="category" className={LABEL_CLS}>Category</label>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleField}
                  className={INPUT_CLS}
                >
                  {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <InputField
                label="Duration (minutes)"
                name="duration"
                type="number"
                value={form.duration}
                onChange={handleField}
                min={1}
                max={300}
                required
              />
            </div>
          </SectionCard>

          {/* ── 2. Questions & Marks ──────────────────────────────────────── */}
          <SectionCard title="📊 Questions & Marks">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">

              <InputField
                label="Total Questions"
                name="totalQuestions"
                type="number"
                value={form.totalQuestions}
                onChange={handleField}
                min={1}
                max={500}
                required
              />

              <InputField
                label="Total Marks"
                name="totalMarks"
                type="number"
                value={form.totalMarks}
                onChange={handleField}
                min={1}
                required
              />

              <div>
                <InputField
                  label="Pass Marks"
                  name="passMarks"
                  type="number"
                  value={form.passMarks}
                  onChange={handleField}
                  min={0}
                  max={form.totalMarks || undefined}
                  required
                />
                <p className="text-xs text-emerald-600 font-semibold mt-1.5">
                  = {passPercentage}% to pass
                </p>
              </div>

              <InputField
                label="Attempts Allowed"
                name="attemptsAllowed"
                type="number"
                value={form.attemptsAllowed}
                onChange={handleField}
                min={1}
                max={10}
                hint="How many times each student may attempt"
              />
            </div>

            {/* Summary strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
              {[
                ['Questions',  form.totalQuestions],
                ['Total Marks',form.totalMarks],
                ['Pass Marks', form.passMarks],
                ['Duration',   `${form.duration}m`],
              ].map(([lbl, val]) => (
                <div key={lbl} className="bg-white rounded-lg p-3 border border-blue-100 text-center">
                  <p className="text-base font-black text-blue-800 leading-tight">{val}</p>
                  <p className="text-xs text-blue-500 mt-0.5">{lbl}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* ── 3. Difficulty Ratio ───────────────────────────────────────── */}
          <SectionCard title="🎯 Difficulty Ratio">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <p className="text-xs text-gray-500">
                Set what percentage of questions come from each difficulty level.
                <strong className="text-gray-700"> Must total 100%.</strong>
              </p>
              <span className={`text-sm font-black px-3 py-1 rounded-full ${
                ratioSum === 100
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {ratioSum}% {ratioSum === 100 ? '✓' : '≠ 100'}
              </span>
            </div>

            {/* Stacked visual bar */}
            <div className="flex rounded-xl overflow-hidden h-7 mb-5 bg-gray-100 text-white text-xs font-black">
              {DIFFS.map(d => {
                const pct = Number(form.difficultyRatio[d.key]) || 0
                return pct > 0 ? (
                  <div
                    key={d.key}
                    className={`${d.bar} flex items-center justify-center transition-all duration-300`}
                    style={{ width: `${pct}%` }}
                    title={`${d.key}: ${pct}%`}
                  >
                    {pct >= 8 ? `${pct}%` : ''}
                  </div>
                ) : null
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {DIFFS.map(d => (
                <DiffRatioCard
                  key={d.key}
                  diffKey={d.key}
                  label={d.label}
                  bar={d.bar}
                  border={d.border}
                  light={d.light}
                  value={form.difficultyRatio[d.key]}
                  onChange={handleRatio}
                  count={counts[d.key]}
                  avail={qCounts[d.key]}
                />
              ))}
            </div>
          </SectionCard>

          {/* ── 4. Settings ───────────────────────────────────────────────── */}
          <SectionCard title="⚙️ Settings">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              <CheckToggle
                name="shuffleQuestions"
                label="Shuffle Question Order"
                desc="Each student gets questions in a different sequence"
                checked={form.shuffleQuestions}
                onChange={handleField}
              />
              <CheckToggle
                name="shuffleOptions"
                label="Shuffle Answer Options"
                desc="A/B/C/D positions randomised per question"
                checked={form.shuffleOptions}
                onChange={handleField}
              />
              <CheckToggle
                name="negativeMarking"
                label="Enable Negative Marking"
                desc="Deduct marks for wrong answers"
                checked={form.negativeMarking}
                onChange={handleField}
              />
            </div>

            {form.negativeMarking && (
              <div className="mt-3 max-w-xs">
                <InputField
                  label="Marks Deducted Per Wrong Answer"
                  name="negativeMarksPerQ"
                  type="number"
                  value={form.negativeMarksPerQ}
                  onChange={handleField}
                  min={0}
                  max={5}
                  step={0.25}
                  hint="e.g. 0.25 = ¼ mark deducted"
                />
              </div>
            )}
          </SectionCard>

          {/* ── Validation warnings ───────────────────────────────────────── */}
          {validationErrors.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1.5">
              {validationErrors.map((e, i) => (
                <p key={i} className="text-xs font-semibold text-amber-700">⚠️ {e}</p>
              ))}
            </div>
          )}

          {/* API error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-semibold">
              ❌ {error}
            </div>
          )}

          {/* ── Submit ────────────────────────────────────────────────────── */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || !canCreate}
              className={[
                'flex-1 font-black py-4 rounded-2xl text-base transition-all shadow-sm',
                loading || !canCreate
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md',
              ].join(' ')}
            >
              {loading ? '⏳ Creating Quiz…' : '🚀 Create Quiz (Draft)'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/quizzes')}
              className="px-6 py-4 rounded-2xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>

          <p className="text-center text-xs text-gray-400">
            Quiz is created as a <strong>Draft</strong>. Go to Manage Quizzes → click <strong>Publish</strong> to make it visible to students.
          </p>
        </form>
      </div>
    </Layout>
  )
}
