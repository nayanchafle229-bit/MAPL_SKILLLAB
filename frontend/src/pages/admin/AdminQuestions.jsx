/**
 * AdminQuestions.jsx — Production-ready question bank manager
 *
 * BUG FIXES:
 *  - All handlers stabilised with useCallback
 *  - No inline component definitions
 *  - Controlled inputs all have stable onChange refs
 *  - Modal form does not remount on parent state change
 *  - Textarea auto-resizes
 *  - Text overflow fixed on all inputs
 */

import React, {
  useState, useEffect, useCallback, useMemo, useRef, memo,
} from 'react'
import api from '../../api/axios'
import Layout from '../../components/Layout'
import { Modal, ConfirmDialog, PageLoader, EmptyState } from '../../components/UI'

// ─── Constants ────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  question:      '',
  type:          'MCQ',
  options:       { A: '', B: '', C: '', D: '', E: '' },
  correctAnswer: '',
  category:      'Industrial Automation Concepts & Process Control',
  level:         'apprentice',
  marks:         1,
  qId:           '',
  moduleTopic:   '',
  rationale:     ''
}

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
const LEVELS = ['apprentice','adept','master','legend']
const TYPES  = ['MCQ', 'MULTI', 'NUMERIC']
const OPTS  = ['A','B','C','D','E']
const PER_PAGE = 15

const BULK_PLACEHOLDER = `[
  {
    "qId": "C1-L2-001",
    "question": "What is the primary function of a PID controller?",
    "type": "MCQ",
    "options": { "A": "Provide power", "B": "Maintain setpoint", "C": "Translate signals", "D": "Store data", "E": "" },
    "correctAnswer": "B",
    "rationale": "A PID controller adjusts its output to keep a process variable at the setpoint.",
    "moduleTopic": "PID basics",
    "category": "Industrial Automation Concepts & Process Control",
    "level": "adept",
    "marks": 1
  }
]`

const MASTER_PROMPT_TEMPLATE = `# MICROVERSE AUTOMATION LMS — MASTER CONTENT-CURATION PROMPT

## 1. ROLE

You are the curriculum architect for **Microverse Automation's Projects Engineering LMS**. We build and sell MICROSYS (DCS/PLC), Miralys and Aletix. This is an internal training platform for our own automation/projects engineers — not a public course.

The programme has **11 categories × 4 levels = 44 modules**. Level definitions:

| Level | Meaning | Source mix |
|---|---|---|
| **L1 · APPRENTICE** | Can follow instructions. Knows vocabulary, recognises equipment, reads the drawing. Not yet trusted alone on site. | Video-led. Document only where no adequate video exists. |
| **L2 · ADEPT** | Can work unsupervised. Executes a defined scope correctly, knows when something looks wrong. | 50/50 Video/Document. |
| **L3 · MASTER** | Can design the system. Solves complex, undefined problems. Can lead a team. | Document-led. Technical manuals, P&IDs, C&E matrices. |
| **L4 · LEGEND** | Subject Matter Expert. Defines the standards. Handles escalated site catastrophes. | Real-world case studies & deep technical analysis only. |

## 2. THE QUALITY BAR (CRITICAL)

- **No generic trivia:** Questions must test actual engineering judgement.
- **Plausible distractors:** Every wrong answer must be a common mistake a junior engineer would actually make. No joke answers.
- **Real-world scenarios:** Frame questions around real scenarios (e.g. "During commissioning of a boiler feed pump...").

## 3. OUTPUT FORMAT (STRICT JSON)

Output ONLY a raw, unformatted JSON array of objects. No markdown backticks, no preamble, no conversational text.

Schema per object:
- "qId": (string) Format: [Cat Code]-[Level Code]-[Number]. e.g. "C03-L2-005"
- "question": (string)
- "type": (string) "MCQ", "MULTI", or "NUMERIC"
- "options": (object) Keys A,B,C,D,E. Leave E blank ("") if 4 options. Blank all if NUMERIC.
- "correctAnswer": (string) "C", "A,C,D", or the exact number string.
- "rationale": (string) 2-3 sentences explaining why it's right and others are wrong.
- "moduleTopic": (string) Sub-topic this belongs to.
- "level": (string) "apprentice", "adept", "master", or "legend"
- "category": (string) Exact name of the category.

---

**TASK:** Generate {{COUNT}} {{LEVEL}} questions for Category: "{{CATEGORY}}"`

// ─── Input style ──────────────────────────────────────────────────────────────
const INPUT_CLS = 'w-full min-w-0 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-slate-500 transition-shadow'
const LABEL_CLS = 'block text-sm font-semibold text-slate-300 mb-1.5 leading-tight'

// ─── Option Letter Badge ──────────────────────────────────────────────────────
const OptionBadge = memo(function OptionBadge({ letter, isCorrect, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={`Mark ${letter} as correct answer`}
      className={[
        'w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 transition-all',
        isCorrect
          ? 'bg-accent-500 text-white shadow-sm ring-2 ring-emerald-300'
          : 'bg-white/5 text-slate-400 hover:bg-accent-500/15 hover:text-accent-400',
      ].join(' ')}
    >
      {letter}
    </button>
  )
})

// ─── Question Form (inside modal — stable, no inline definitions) ─────────────
const QuestionForm = memo(function QuestionForm({
  form, onField, onOption, onCorrect, onSubmit, saving, error, isEditing,
}) {
  const taRef = useRef(null)

  // Auto-resize question textarea
  useEffect(() => {
    const el = taRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [form.question])

  return (
    <form onSubmit={onSubmit} className="space-y-4">

      {/* Question text */}
      <div>
        <label className={LABEL_CLS}>Question Text *</label>
        <textarea
          ref={taRef}
          name="question"
          value={form.question}
          onChange={onField}
          rows={3}
          placeholder="Enter the full question…"
          required
          className={`${INPUT_CLS} resize-none overflow-hidden whitespace-pre-wrap break-words`}
          style={{ minHeight: '4.5rem' }}
        />
      </div>

      {/* Options & Answer */}
      {form.type === 'NUMERIC' ? (
        <div>
          <label className={LABEL_CLS}>Correct Numeric Answer *</label>
          <input
            type="text"
            name="correctAnswer"
            value={form.correctAnswer}
            onChange={onField}
            placeholder="e.g. 40 (graded with ±5% tolerance)"
            required
            className={INPUT_CLS}
          />
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={LABEL_CLS} style={{ marginBottom: 0 }}>Options *</label>
            <span className="text-xs text-slate-500 font-medium">
              Click letter to set correct answer {form.type === 'MULTI' && '(multi-select enabled)'}
            </span>
          </div>
          <div className="space-y-2">
            {OPTS.map(opt => (
              <div key={opt} className="flex items-center gap-2">
                <OptionBadge
                  letter={opt}
                  isCorrect={form.correctAnswer.includes(opt)}
                  onClick={() => onCorrect(opt)}
                />
                <input
                  type="text"
                  name={opt}
                  value={form.options[opt]}
                  onChange={onOption}
                  placeholder={`Option ${opt}…`}
                  required={opt !== 'E' && form.type !== 'MULTI'} // E might be optional, or MULTI might not need all
                  className={INPUT_CLS}
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-accent-400 font-semibold mt-2">
            ✓ Correct answer: <strong>{form.correctAnswer || '(none)'}</strong>
          </p>
        </div>
      )}

      {/* Meta Row 1: Identifiers & Tracking */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLS}>Question ID (qId)</label>
          <input type="text" name="qId" value={form.qId || ''} onChange={onField} placeholder="e.g. C4-L1-001" className={INPUT_CLS} />
        </div>
        <div>
          <label className={LABEL_CLS}>Module Topic (Traces to)</label>
          <input type="text" name="moduleTopic" value={form.moduleTopic || ''} onChange={onField} placeholder="e.g. PID basics" className={INPUT_CLS} />
        </div>
      </div>

      {/* Rationale */}
      <div>
        <label className={LABEL_CLS}>Rationale (Why correct/incorrect)</label>
        <textarea
          name="rationale"
          value={form.rationale || ''}
          onChange={onField}
          rows={2}
          placeholder="Explain the correct answer and what misconceptions the wrong options represent..."
          className={`${INPUT_CLS} resize-y font-normal`}
        />
      </div>

      {/* Meta Row 2: Categorization */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div>
          <label className={LABEL_CLS}>Type</label>
          <select name="type" value={form.type || 'MCQ'} onChange={onField} className={INPUT_CLS}>
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="sm:col-span-1">
          <label className={LABEL_CLS}>Category</label>
          <select name="category" value={form.category} onChange={onField} className={INPUT_CLS}>
            {CATS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={LABEL_CLS}>Level</label>
          <select name="level" value={form.level || 'apprentice'} onChange={onField} className={INPUT_CLS}>
            {LEVELS.map(l => (
              <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL_CLS}>Marks</label>
          <input
            type="number"
            name="marks"
            value={form.marks}
            onChange={onField}
            min={0.5}
            step={0.5}
            className={INPUT_CLS}
          />
        </div>
      </div>

      {error && (
        <p className="text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
          ❌ {error}
        </p>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-sm transition-colors"
        >
          {saving ? '⏳ Saving…' : isEditing ? '✓ Update Question' : '+ Add Question'}
        </button>
      </div>
    </form>
  )
})

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminQuestions() {
  const [questions, setQuestions] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [modal,     setModal]     = useState(false)   // add/edit
  const [bulkModal, setBulkModal] = useState(false)
  const [editing,   setEditing]   = useState(null)
  const [form,      setForm]      = useState(EMPTY_FORM)
  const [bulkText,  setBulkText]  = useState('')
  const [bulkCat,   setBulkCat]   = useState(CATS[0])
  const [bulkLevel, setBulkLevel] = useState(LEVELS[0])
  
  // AI Generator state
  const [aiGenModal, setAiGenModal] = useState(false)
  const [aiCat,      setAiCat]      = useState(CATS[0])
  const [aiLevel,    setAiLevel]    = useState(LEVELS[0])
  const [aiCount,    setAiCount]    = useState(15)

  const [saving,    setSaving]    = useState(false)
  const [formError, setFormError] = useState('')
  const [toast,     setToast]     = useState('')   // success message
  const [delId,     setDelId]     = useState(null)
  const [search,    setSearch]    = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [filterLevel,setFilterLevel]= useState('')
  const [page,      setPage]      = useState(1)

  // ── Load ───────────────────────────────────────────────────────────────────
  const load = useCallback(() => {
    setLoading(true)
    api.get('/question')
      .then(({ data }) => setQuestions(data.questions || []))
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }, [])

  // ── Modal open/close ────────────────────────────────────────────────────────
  const openAdd = useCallback(() => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setModal(true)
  }, [])

  const openEdit = useCallback((q) => {
    setEditing(q)
    setForm({
      question:      q.question || '',
      type:          q.type || 'MCQ',
      options:       { 
        A: q.options?.A || '', 
        B: q.options?.B || '', 
        C: q.options?.C || '', 
        D: q.options?.D || '', 
        E: q.options?.E || '' 
      },
      correctAnswer: q.correctAnswer || '',
      category:      q.category || CATS[0],
      level:         q.level || 'apprentice',
      marks:         q.marks || 1,
      qId:           q.qId || '',
      moduleTopic:   q.moduleTopic || '',
      rationale:     q.rationale || ''
    })
    setFormError('')
    setModal(true)
  }, [])

  const closeModal = useCallback(() => {
    setModal(false)
    setFormError('')
  }, [])

  // ── Form handlers — all stable refs ────────────────────────────────────────
  const handleField = useCallback((e) => {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value) || 0) : value,
    }))
  }, [])

  const handleOption = useCallback((e) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      options: { ...prev.options, [name]: value },
    }))
  }, [])

  const handleCorrect = useCallback((opt) => {
    setForm(prev => {
      if (prev.type === 'MULTI') {
        const arr = prev.correctAnswer ? prev.correctAnswer.split(',') : []
        if (arr.includes(opt)) {
          return { ...prev, correctAnswer: arr.filter(o => o !== opt).sort().join(',') }
        } else {
          return { ...prev, correctAnswer: [...arr, opt].sort().join(',') }
        }
      }
      return { ...prev, correctAnswer: opt }
    })
  }, [])

  // ── Save single question ────────────────────────────────────────────────────
  const save = useCallback(async (e) => {
    e.preventDefault()
    if (!form.question.trim()) { setFormError('Question text is required'); return }
    
    if (form.type !== 'NUMERIC') {
      for (const o of ['A','B','C','D']) {
        if (!form.options[o]?.trim()) { setFormError(`Option ${o} is required`); return }
      }
    }
    
    if (!form.correctAnswer.trim()) { setFormError('Correct answer is required'); return }

    setSaving(true)
    setFormError('')
    try {
      if (editing) {
        await api.put(`/question/${editing._id}`, form)
        showToast('✅ Question updated')
      } else {
        await api.post('/question', form)
        showToast('✅ Question added')
      }
      setModal(false)
      load()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }, [form, editing, load, showToast])

  // ── Bulk import ─────────────────────────────────────────────────────────────
  const saveBulk = useCallback(async () => {
    setSaving(true)
    setFormError('')
    try {
      const parsed = JSON.parse(bulkText)
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('Must be a non-empty JSON array')
      }
      
      // Use category and level from JSON, fallback to bulkCat and bulkLevel
      const finalParsed = parsed.map(q => ({ 
        ...q, 
        category: q.category || bulkCat,
        level: q.level || bulkLevel
      }))
      
      const { data } = await api.post('/question', finalParsed)
      setBulkModal(false)
      setBulkText('')
      showToast(data.message || `✅ ${parsed.length} questions imported`)
      load()
    } catch (err) {
      setFormError(
        err.message.toLowerCase().includes('json')
          ? 'Invalid JSON — check your format'
          : err.response?.data?.message || err.message
      )
    } finally {
      setSaving(false)
    }
  }, [bulkText, bulkCat, bulkLevel, load, showToast])

  // ── Delete ──────────────────────────────────────────────────────────────────
  const deleteQ = useCallback(async () => {
    try {
      await api.delete(`/question/${delId}`)
      setDelId(null)
      showToast('✅ Question deleted')
      load()
    } catch (err) {
      showToast('❌ Delete failed: ' + (err.response?.data?.message || err.message))
    }
  }, [delId, load, showToast])

  // ── Filtering & pagination ──────────────────────────────────────────────────
  const { filtered, totalPages, paged } = useMemo(() => {
    const filtered = questions.filter(q => {
      // "DEL THOSE ALSO" -> strict filter to only these 11 categories
      if (!q || !CATS.includes(q.category)) return false

      const matchSearch = !search   || (q.question || '').toLowerCase().includes(search.toLowerCase())
      const matchCat    = !filterCat  || q.category  === filterCat
      const matchLevel  = !filterLevel || q.level === filterLevel
      return matchSearch && matchCat && matchLevel
    })
    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
    const safePage   = Math.min(page, totalPages)
    const paged      = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)
    return { filtered, totalPages, paged }
  }, [questions, search, filterCat, filterLevel, page])

  const levelCount = useMemo(() => ({
    apprentice: questions.filter(q => q.level === 'apprentice').length,
    adept:      questions.filter(q => q.level === 'adept').length,
    master:     questions.filter(q => q.level === 'master').length,
    legend:     questions.filter(q => q.level === 'legend').length,
  }), [questions])

  const handleSearch    = useCallback((e) => { setSearch(e.target.value);   setPage(1) }, [])
  const handleCatFilter = useCallback((e) => { setFilterCat(e.target.value); setPage(1) }, [])
  const handleLevelFilter= useCallback((e) => { setFilterLevel(e.target.value);setPage(1) }, [])

  // ── Render ──────────────────────────────────────────────────────────────────
  if (loading) return <Layout title="Question Bank"><PageLoader /></Layout>

  return (
    <Layout title="Question Bank">

      {/* Modals */}
      <ConfirmDialog
        open={!!delId}
        onClose={() => setDelId(null)}
        onConfirm={deleteQ}
        title="Delete Question?"
        message="This permanently removes the question from the bank."
        confirmLabel="Delete"
        danger
      />

      {/* Add / Edit modal */}
      <Modal
        open={modal}
        onClose={closeModal}
        title={editing ? 'Edit Question' : 'Add Question'}
      >
        <QuestionForm
          form={form}
          onField={handleField}
          onOption={handleOption}
          onCorrect={handleCorrect}
          onSubmit={save}
          saving={saving}
          error={formError}
          isEditing={!!editing}
        />
      </Modal>

      {/* Bulk import modal */}
      <Modal open={bulkModal} onClose={() => { setBulkModal(false); setFormError('') }} title="Bulk Import Questions">
        <div className="space-y-4">
          <div className="p-3 bg-primary-500/10 border border-primary-500/20 rounded-xl text-xs text-primary-300 leading-relaxed">
            <p className="font-bold mb-1">Expected JSON format:</p>
            <p>Array of objects, each with: <code className="bg-primary-500/15 px-1 rounded">question</code>, <code className="bg-primary-500/15 px-1 rounded">options</code> (A–D), <code className="bg-primary-500/15 px-1 rounded">correctAnswer</code>, optionally <code className="bg-primary-500/15 px-1 rounded">difficulty</code>, <code className="bg-primary-500/15 px-1 rounded">marks</code>.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5 leading-tight">Fallback Category</label>
              <select value={bulkCat} onChange={e => setBulkCat(e.target.value)} className="w-full min-w-0 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow">
                {CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5 leading-tight">Fallback Level</label>
              <select value={bulkLevel} onChange={e => setBulkLevel(e.target.value)} className="w-full min-w-0 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow">
                {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <textarea
            value={bulkText}
            onChange={e => setBulkText(e.target.value)}
            rows={14}
            placeholder={BULK_PLACEHOLDER}
            spellCheck={false}
            className={`${INPUT_CLS} resize-y font-mono text-xs leading-relaxed`}
            style={{ minHeight: '14rem' }}
          />
          {formError && (
            <p className="text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">❌ {formError}</p>
          )}
          <div className="flex gap-3">
            <button
              onClick={saveBulk}
              disabled={saving || !bulkText.trim()}
              className="flex-1 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-sm transition-colors"
            >
              {saving ? '⏳ Importing…' : '📥 Import Questions'}
            </button>
            <button
              onClick={() => { setBulkModal(false); setFormError('') }}
              className="px-5 py-3 rounded-xl border border-white/10 text-sm font-semibold text-slate-300 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* AI Prompt Generator Modal */}
      <Modal open={aiGenModal} onClose={() => setAiGenModal(false)} title="🤖 AI Content Generator">
        <div className="space-y-4">
          <p className="text-sm text-slate-300">Generate perfectly formatted questions by instructing your preferred AI (ChatGPT/Claude) with the Microverse Curriculum Prompt.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className={LABEL_CLS}>Category</label>
              <select value={aiCat} onChange={e => setAiCat(e.target.value)} className={INPUT_CLS}>
                {CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL_CLS}>Level</label>
              <select value={aiLevel} onChange={e => setAiLevel(e.target.value)} className={INPUT_CLS}>
                {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
              </select>
            </div>
            <div className="sm:col-span-3">
              <label className={LABEL_CLS}>Count</label>
              <input type="number" value={aiCount} onChange={e => setAiCount(e.target.value)} min={1} max={50} className={INPUT_CLS} />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-1.5">
              <label className={LABEL_CLS} style={{marginBottom: 0}}>Generated Master Prompt</label>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(MASTER_PROMPT_TEMPLATE.replace('{{COUNT}}', aiCount).replace('{{LEVEL}}', aiLevel.toUpperCase()).replace('{{CATEGORY}}', aiCat))
                  showToast('✅ Copied to clipboard! Paste this in ChatGPT.')
                }}
                className="text-xs bg-accent-500/10 text-accent-400 hover:bg-accent-500/20 font-bold px-3 py-1.5 rounded-lg transition-colors border border-accent-500/20"
              >
                📋 Copy Prompt
              </button>
            </div>
            <div className="bg-black/40 border border-white/10 rounded-xl p-4 text-xs font-mono text-slate-400 whitespace-pre-wrap max-h-64 overflow-y-auto">
              {MASTER_PROMPT_TEMPLATE.replace('{{COUNT}}', aiCount).replace('{{LEVEL}}', aiLevel.toUpperCase()).replace('{{CATEGORY}}', aiCat)}
            </div>
          </div>
          
          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setAiGenModal(false)}
              className="px-5 py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-slate-300 hover:bg-white/5 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-surface-raised text-white border border-white/10 text-sm font-semibold px-5 py-3 rounded-xl shadow-2xl animate-pulse">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-white">❓ Question Bank</h2>
          <div className="flex gap-3 mt-1.5 flex-wrap text-xs font-semibold">
            <span className="bg-emerald-500/15 text-emerald-300 px-2.5 py-1 rounded-full">L1: {levelCount.apprentice}</span>
            <span className="bg-blue-500/15 text-blue-300 px-2.5 py-1 rounded-full">L2: {levelCount.adept}</span>
            <span className="bg-amber-500/15 text-amber-300 px-2.5 py-1 rounded-full">L3: {levelCount.master}</span>
            <span className="bg-red-500/15 text-red-300 px-2.5 py-1 rounded-full">L4: {levelCount.legend}</span>
            <span className="bg-white/5 text-slate-400 px-2.5 py-1 rounded-full">Total: {questions.length}</span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setAiGenModal(true)}
            className="bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-300 font-bold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
          >
            🤖 AI Generator
          </button>
          <button
            onClick={() => { setFormError(''); setBulkModal(true) }}
            className="bg-white/5 border border-white/10 hover:bg-white/5 text-slate-300 font-bold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
          >
            📥 Bulk Import
          </button>
          <button
            onClick={openAdd}
            className="bg-primary-600 hover:bg-primary-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
          >
            + Add Question
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="text"
          placeholder="🔍 Search questions…"
          value={search}
          onChange={handleSearch}
          className="border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white/5 flex-1 min-w-[180px] max-w-xs"
        />
        <select value={filterCat}  onChange={handleCatFilter}  className="border border-white/10 rounded-xl px-3 py-2.5 text-sm bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="">All Categories</option>
          {CATS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterLevel} onChange={handleLevelFilter} className="border border-white/10 rounded-xl px-3 py-2.5 text-sm bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="">All Levels</option>
          {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
        </select>
        <span className="self-center text-sm text-slate-500 ml-auto">{filtered.length} questions</span>
      </div>

      {questions.length === 0 ? (
        <EmptyState
          icon="❓"
          title="No questions yet"
          description="Add individual questions or use Bulk Import for large sets (e.g. the 200-question MySQL JSON)."
          action={
            <div className="flex gap-3 justify-center">
              <button onClick={openAdd} className="bg-primary-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm">+ Add Question</button>
              <button onClick={() => setAiGenModal(true)} className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold px-5 py-2.5 rounded-xl text-sm">🤖 AI Gen</button>
              <button onClick={() => setBulkModal(true)} className="bg-white/5 border border-white/10 text-slate-300 font-bold px-5 py-2.5 rounded-xl text-sm">📥 Bulk Import</button>
            </div>
          }
        />
      ) : (
        <>
          {/* Question table */}
          <div className="bg-surface-card rounded-2xl border border-white/10 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    {['#','ID / Type','Question','Options','Answer','Category','Level','Marks','Actions'].map(h => (
                      <th key={h} className="text-left text-xs font-black text-slate-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paged.map((q, i) => (
                    <tr key={q._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-xs text-slate-500 font-bold whitespace-nowrap">
                        {(page - 1) * PER_PAGE + i + 1}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-xs font-bold text-slate-300">{q.qId || '—'}</div>
                        <div className="text-[10px] uppercase font-black text-slate-500 tracking-wider mt-0.5">{q.type || 'MCQ'}</div>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="text-sm font-medium text-white line-clamp-2 break-words leading-snug">
                          {q.question}
                        </p>
                      </td>
                      <td className="px-4 py-3 min-w-[180px]">
                        {q.type === 'NUMERIC' ? (
                           <span className="text-xs text-slate-400 italic">Numeric input</span>
                        ) : (
                          <div className="space-y-0.5">
                            {['A','B','C','D','E'].map(o => {
                              if (!q.options?.[o]) return null
                              const isCorrect = (q.type === 'MULTI' && (q.correctAnswer||'').includes(o)) || (q.correctAnswer === o)
                              return (
                                <div key={o} className={`text-xs leading-snug truncate ${isCorrect ? 'text-accent-400 font-bold' : 'text-slate-400'}`}>
                                  <span className="font-black mr-1">{o}.</span>
                                  {q.options[o]}
                                  {isCorrect && ' ✓'}
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-1.5 bg-accent-500 text-white rounded-lg font-black text-xs">
                          {q.correctAnswer || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {q.category
                          ? <span className="text-xs bg-primary-500/10 text-primary-400 px-2.5 py-1 rounded-full font-semibold whitespace-nowrap">{q.category}</span>
                          : <span className="text-slate-600 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap uppercase tracking-wider ${
                          q.level === 'apprentice' ? 'bg-emerald-500/15 text-emerald-300' :
                          q.level === 'adept'      ? 'bg-blue-500/15 text-blue-300' :
                          q.level === 'master'     ? 'bg-amber-500/15 text-amber-300' :
                          q.level === 'legend'     ? 'bg-red-500/15 text-red-300' :
                                                     'bg-slate-500/15 text-slate-300'
                        }`}>
                          {q.level || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-300 text-xs whitespace-nowrap">
                        {q.marks || 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => openEdit(q)}
                            className="text-xs bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 font-bold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDelId(q._id)}
                            className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                          >
                            Del
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-5 flex-wrap">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl border border-white/10 text-sm font-semibold text-slate-300 hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>
              {Array.from({ length: Math.min(7, totalPages) }, (_, idx) => {
                const p = totalPages <= 7
                  ? idx + 1
                  : page <= 4 ? idx + 1
                  : page >= totalPages - 3 ? totalPages - 6 + idx
                  : page - 3 + idx
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-xl text-sm font-bold transition-colors ${
                      page === p
                        ? 'bg-primary-600 text-white'
                        : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    {p}
                  </button>
                )
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-xl border border-white/10 text-sm font-semibold text-slate-300 hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
              <span className="text-xs text-slate-500">
                Page {page}/{totalPages} · {filtered.length} questions
              </span>
            </div>
          )}
        </>
      )}
    </Layout>
  )
}
