import React, {
  useState, useEffect, useCallback, useMemo, useRef, memo,
} from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import Layout from '../../components/Layout'

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS  (module scope — never recreated)
// ─────────────────────────────────────────────────────────────────────────────
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

const LEVELS = [
  { key: 'apprentice', label: 'L1 · Apprentice' },
  { key: 'adept',      label: 'L2 · Adept' },
  { key: 'master',     label: 'L3 · Master' },
  { key: 'legend',     label: 'L4 · Legend' },
]

const BLUEPRINT = {
  apprentice: { qs: 15, mins: 25, passPct: 70 },
  adept:      { qs: 20, mins: 40, passPct: 75 },
  master:     { qs: 20, mins: 60, passPct: 80 },
  legend:     { qs: 12, mins: 90, passPct: 80 },
}

const INPUT_CLS = [
  'w-full min-w-0',
  'border border-white/10 rounded-xl',
  'px-4 py-2.5',
  'text-sm text-white',
  'bg-surface-card',
  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
  'placeholder:text-slate-500',
  'transition-shadow duration-150',
  'leading-normal',
  'overflow-hidden text-ellipsis',
].join(' ')

const LABEL_CLS = 'block text-sm font-bold text-slate-300 mb-1.5 leading-tight'

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVE INPUT COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const InputField = memo(function InputField({
  label, name, type = 'text', value, onChange,
  min, max, step, placeholder, required, hint,
  autoFocus,
}) {
  return (
    <div className="flex flex-col min-w-0">
      <label htmlFor={name} className={LABEL_CLS}>
        {label}
        {required && <span className="text-red-400 ml-0.5" aria-hidden>*</span>}
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
      {hint && <p className="text-xs text-slate-500 mt-1 leading-snug">{hint}</p>}
    </div>
  )
})

const TextAreaField = memo(function TextAreaField({
  label, name, value, onChange, placeholder, rows = 3, required, hint,
}) {
  const ref = useRef(null)

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
        {required && <span className="text-red-400 ml-0.5" aria-hidden>*</span>}
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
      {hint && <p className="text-xs text-slate-500 mt-1 leading-snug">{hint}</p>}
    </div>
  )
})

const CheckToggle = memo(function CheckToggle({ name, label, desc, checked, onChange }) {
  return (
    <label
      htmlFor={`chk-${name}`}
      className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-white/5 transition-colors select-none"
    >
      <input
        id={`chk-${name}`}
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="mt-0.5 w-4 h-4 text-primary-400 rounded border-white/20 focus:ring-primary-500 flex-shrink-0 cursor-pointer"
      />
      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-100 leading-tight">{label}</p>
        <p className="text-xs text-slate-400 mt-0.5 leading-snug">{desc}</p>
      </div>
    </label>
  )
})

const SectionCard = memo(function SectionCard({ title, children }) {
  return (
    <div className="bg-surface-card rounded-2xl border border-white/10 shadow-sm p-6">
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5">{title}</h3>
      {children}
    </div>
  )
})

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminQuizCreate() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title:           '',
    description:     '',
    category:        'Industrial Automation Concepts & Process Control',
    level:           'apprentice',
    caseStudyPrompt: '',
    totalQuestions:  15,
    totalMarks:      15,
    passMarks:       11,
    duration:        25,
    negativeMarking:   false,
    negativeMarksPerQ: 0.25,
    shuffleQuestions:  true,
    shuffleOptions:    true,
    attemptsAllowed:   1,
  })

  const [qCounts, setQCounts] = useState({})
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  // Fetch live counts once
  useEffect(() => {
    api.get('/question')
      .then(({ data }) => {
        const qs = data.questions || []
        // Group questions by category+level
        const counts = {}
        qs.forEach(q => {
          if (q.isActive) {
            const key = `${q.category}_${q.level}`
            counts[key] = (counts[key] || 0) + 1
          }
        })
        setQCounts(counts)
      })
      .catch(() => {})
  }, [])

  // ── Handlers ──────────────────────────────────────────────────────────────
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

  const handleLevelOrCategoryChange = useCallback((e) => {
    const { name, value } = e.target
    
    setForm(prev => {
      const nextForm = { ...prev, [name]: value }
      
      // Auto-fill blueprint defaults if level changes
      if (name === 'level' && BLUEPRINT[value]) {
        const bp = BLUEPRINT[value]
        nextForm.totalQuestions = bp.qs
        nextForm.totalMarks = bp.qs // 1 mark per question by default
        nextForm.duration = bp.mins
        nextForm.passMarks = Math.ceil(bp.qs * (bp.passPct / 100))
        if (value !== 'legend') {
          nextForm.caseStudyPrompt = '' // clear case study if not legend
        }
      }

      return nextForm
    })
  }, [])

  // ── Derived values ────────────────────────────────────────────────────────
  const passPercentage = useMemo(() => {
    const tm = Number(form.totalMarks) || 0
    const pm = Number(form.passMarks)  || 0
    return tm > 0 ? ((pm / tm) * 100).toFixed(1) : '0'
  }, [form.totalMarks, form.passMarks])

  const availCount = qCounts[`${form.category}_${form.level}`] || 0

  const validationErrors = useMemo(() => {
    const errs = []
    
    if (form.totalQuestions > availCount) {
      errs.push(`Need ${form.totalQuestions} questions — only ${availCount} available for ${form.category} at this level`)
    }
    
    if (!form.title.trim())
      errs.push('Quiz title is required')
    if (form.level === 'legend' && !form.caseStudyPrompt.trim())
      errs.push('Case Study prompt is required for Legend level')
    if (Number(form.totalQuestions) < 1)
      errs.push('Total questions must be at least 1')
    if (Number(form.totalMarks) < 1)
      errs.push('Total marks must be at least 1')
    if (Number(form.passMarks) > Number(form.totalMarks))
      errs.push('Pass marks cannot exceed total marks')
    return errs
  }, [form, availCount])

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
        level:           form.level,
        caseStudyPrompt: form.level === 'legend' ? form.caseStudyPrompt.trim() : undefined,
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
            <h2 className="text-2xl font-black text-white leading-tight">🧠 Create New Quiz</h2>
            <p className="text-slate-400 text-sm mt-1">
              Select category and level — the system auto-fills blueprint defaults.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/admin/quizzes')}
            className="flex-shrink-0 text-sm text-slate-400 hover:text-slate-100 font-semibold transition-colors"
          >
            ← Back
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5" noValidate>

          {/* ── 1. Basic Info ─────────────────────────────────────────────── */}
          <SectionCard title="📝 Blueprint Config">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="sm:col-span-2">
                <label htmlFor="category" className={LABEL_CLS}>Category</label>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleLevelOrCategoryChange}
                  className={INPUT_CLS}
                >
                  {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="level" className={LABEL_CLS}>Level (Auto-fills defaults)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {LEVELS.map(l => (
                    <label key={l.key} className={`cursor-pointer border text-center rounded-xl py-3 px-2 transition-all ${
                      form.level === l.key 
                        ? 'bg-primary-500/20 border-primary-500 text-primary-300 shadow-[0_0_15px_rgba(var(--color-primary-500),0.1)]' 
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/20'
                    }`}>
                      <input 
                        type="radio" name="level" value={l.key} 
                        checked={form.level === l.key} onChange={handleLevelOrCategoryChange} 
                        className="sr-only" 
                      />
                      <span className="font-bold text-sm block">{l.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2 mt-2">
                <InputField
                  label="Quiz Title"
                  name="title"
                  value={form.title}
                  onChange={handleField}
                  placeholder="e.g. Apprentice Automation Baseline"
                  required
                  autoFocus
                />
              </div>

              <div className="sm:col-span-2">
                <TextAreaField
                  label="Description (Optional)"
                  name="description"
                  value={form.description}
                  onChange={handleField}
                  placeholder="Brief description shown to students before they start…"
                  rows={2}
                />
              </div>
              
              {form.level === 'legend' && (
                <div className="sm:col-span-2">
                  <TextAreaField
                    label="Legend Case Study Prompt"
                    name="caseStudyPrompt"
                    value={form.caseStudyPrompt}
                    onChange={handleField}
                    placeholder="Provide the case study scenario that the student must analyze..."
                    rows={4}
                    required
                  />
                </div>
              )}

            </div>
          </SectionCard>

          {/* ── 2. Questions & Marks ──────────────────────────────────────── */}
          <SectionCard title="📊 Questions & Marks">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">

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
                <p className="text-xs text-accent-400 font-semibold mt-1.5">
                  = {passPercentage}% to pass
                </p>
              </div>

              <InputField
                label="Duration (mins)"
                name="duration"
                type="number"
                value={form.duration}
                onChange={handleField}
                min={1}
                max={300}
                required
              />
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-300">
                Available {LEVELS.find(l=>l.key===form.level)?.label.split('·')[1].trim()} questions for this category:
              </span>
              <span className={`text-lg font-black ${form.totalQuestions > availCount ? 'text-red-400' : 'text-accent-400'}`}>
                {availCount}
              </span>
            </div>
          </SectionCard>

          {/* ── 4. Settings ───────────────────────────────────────────────── */}
          <SectionCard title="⚙️ Settings">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
              
              <div className="p-3">
                <InputField
                  label="Attempts Allowed"
                  name="attemptsAllowed"
                  type="number"
                  value={form.attemptsAllowed}
                  onChange={handleField}
                  min={1}
                  max={10}
                />
              </div>
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
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 space-y-1.5">
              {validationErrors.map((e, i) => (
                <p key={i} className="text-xs font-semibold text-amber-300">⚠️ {e}</p>
              ))}
            </div>
          )}

          {/* API error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl px-4 py-3 text-sm font-semibold">
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
                  ? 'bg-white/10 text-slate-500 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-500 text-white hover:shadow-md',
              ].join(' ')}
            >
              {loading ? '⏳ Creating Quiz…' : '🚀 Create Quiz (Draft)'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/quizzes')}
              className="px-6 py-4 rounded-2xl border border-white/10 text-slate-300 font-bold text-sm hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
          </div>

          <p className="text-center text-xs text-slate-500">
            Quiz is created as a <strong>Draft</strong>. Go to Manage Quizzes → click <strong>Publish</strong> to make it visible to students.
          </p>
        </form>
      </div>
    </Layout>
  )
}
