/**
 * QuizAttempt.jsx — Full quiz-taking experience
 * Fixes:
 *  - useCallback on all handlers to prevent unnecessary re-renders
 *  - select() stores both selected label AND the optMap for backend reverse-mapping
 *  - stopTimer moved to useRef-based stable ref (avoids stale closure)
 *  - Proper error display for 409 (already submitted) and other errors
 *  - Countdown warning colors
 *  - Palette dots use question _id as key
 */
import React, {
  useState, useEffect, useCallback, useRef, useMemo, memo,
} from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { PageLoader, ConfirmDialog } from '../../components/UI'

// ── Sub-components defined at module level (no focus-loss risk here since
//    QuizAttempt does not use inputs — only buttons — but good practice) ────────

const DiffBadge = memo(function DiffBadge({ level }) {
  const cls = {
    easy:   'bg-emerald-100 text-emerald-700',
    medium: 'bg-amber-100 text-amber-700',
    hard:   'bg-red-100 text-red-700',
  }[level] || 'bg-gray-100 text-gray-500'
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${cls}`}>
      {level}
    </span>
  )
})

// ── Timer display ──────────────────────────────────────────────────────────────
const TimerDisplay = memo(function TimerDisplay({ seconds }) {
  const m   = Math.floor(seconds / 60)
  const s   = seconds % 60
  const cls = seconds < 300 ? 'text-red-500' : seconds < 600 ? 'text-amber-500' : 'text-emerald-500'
  return (
    <div className={`flex items-center gap-1.5 font-mono font-black text-xl ${cls}`}>
      <span>⏱️</span>
      <span>{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}</span>
    </div>
  )
})

// ── Question option button ─────────────────────────────────────────────────────
const OptionButton = memo(function OptionButton({ label, text, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all',
        selected
          ? 'border-blue-500 bg-blue-50 shadow-sm'
          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/40',
      ].join(' ')}
    >
      <span className={[
        'w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 transition-all',
        selected ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-600',
      ].join(' ')}>
        {label}
      </span>
      <span className={`text-sm font-medium leading-relaxed flex-1 text-left break-words ${selected ? 'text-blue-800' : 'text-gray-700'}`}>
        {text}
      </span>
      {selected && <span className="ml-auto text-blue-500 flex-shrink-0 text-lg">✓</span>}
    </button>
  )
})

// ── Palette dot ────────────────────────────────────────────────────────────────
const PaletteDot = memo(function PaletteDot({ num, isCurrent, isAnswered, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={`Q${num}${isAnswered ? ' ✓' : ''}`}
      className={[
        'w-full aspect-square rounded-lg text-xs font-black transition-all',
        isCurrent  ? 'bg-blue-600 text-white shadow-sm scale-110' :
        isAnswered ? 'bg-emerald-500 text-white' :
                     'bg-gray-100 text-gray-500 hover:bg-gray-200',
      ].join(' ')}
    >
      {num}
    </button>
  )
})

// ── Main Component ─────────────────────────────────────────────────────────────
const OPT_LABELS = ['A', 'B', 'C', 'D']

export default function QuizAttempt() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [phase,     setPhase]     = useState('loading') // loading|intro|quiz|submitting|error
  const [quiz,      setQuiz]      = useState(null)
  const [questions, setQuestions] = useState([])
  // answers: { [questionId]: { selected: 'A'|'B'|'C'|'D', optMap: {...} } }
  const [answers,   setAnswers]   = useState({})
  const [current,   setCurrent]   = useState(0)
  const [timeLeft,  setTimeLeft]  = useState(0)
  const [errorMsg,  setErrorMsg]  = useState('')
  const [confirm,   setConfirm]   = useState(false)
  const startTsRef  = useRef(null)
  const timerRef    = useRef(null)
  const submitCalled = useRef(false)   // guard double-submit

  // ── Load quiz questions ────────────────────────────────────────────────────
  useEffect(() => {
    api.get(`/quiz/${id}/start`)
      .then(({ data }) => {
        setQuiz(data.quiz)
        setQuestions(data.questions)
        setTimeLeft(data.quiz.duration * 60)
        setPhase('intro')
      })
      .catch(err => {
        if (err.response?.status === 409 && err.response.data.resultId) {
          // Already submitted — go straight to result
          navigate(`/result/${err.response.data.resultId}`, { replace: true })
        } else {
          setErrorMsg(err.response?.data?.message || 'Failed to load quiz')
          setPhase('error')
        }
      })
  }, [id, navigate])

  // ── Stop timer utility (stable across renders) ─────────────────────────────
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // ── Submit ─────────────────────────────────────────────────────────────────
  const doSubmit = useCallback(async () => {
    if (submitCalled.current) return
    submitCalled.current = true
    stopTimer()
    setConfirm(false)
    setPhase('submitting')

    const timeTaken = startTsRef.current
      ? Math.round((Date.now() - startTsRef.current) / 1000)
      : 0

    // Build payload: each answer carries optMap so backend can reverse-map
    const payload = questions.map(q => ({
      questionId: q._id,
      selected:   answers[q._id]?.selected || '',
      optMap:     answers[q._id]?.optMap   || q._optMap || {},
    }))

    try {
      const { data } = await api.post(`/quiz/${id}/submit`, {
        answers: payload,
        timeTaken,
      })
      navigate(`/result/${data.result._id}`)
    } catch (err) {
      submitCalled.current = false
      setErrorMsg(err.response?.data?.message || 'Submission failed — please try again')
      setPhase('quiz')
    }
  }, [questions, answers, id, navigate, stopTimer])

  // ── Countdown timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'quiz') return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          doSubmit()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return stopTimer
  }, [phase, doSubmit, stopTimer])

  // ── Start quiz ─────────────────────────────────────────────────────────────
  const startQuiz = useCallback(() => {
    startTsRef.current = Date.now()
    setCurrent(0)
    setAnswers({})
    submitCalled.current = false
    setPhase('quiz')
  }, [])

  // ── Select an answer ───────────────────────────────────────────────────────
  // Stores: selected label (in the shuffled space) + the optMap for that question
  const selectAnswer = useCallback((qId, label, optMap) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: { selected: label, optMap },
    }))
  }, [])

  const goTo = useCallback((i) => setCurrent(i), [])
  const prev = useCallback(() => setCurrent(c => Math.max(0, c - 1)), [])
  const next = useCallback(() => setCurrent(c => Math.min(questions.length - 1, c + 1)), [questions.length])

  // ── Derived ────────────────────────────────────────────────────────────────
  const q        = questions[current]
  const answered = useMemo(() => Object.keys(answers).length, [answers])
  const total    = questions.length

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE: loading
  // ═══════════════════════════════════════════════════════════════════════════
  if (phase === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <PageLoader text="Loading quiz…" />
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE: error
  // ═══════════════════════════════════════════════════════════════════════════
  if (phase === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-lg font-black text-gray-900 mb-2">Could Not Load Quiz</h2>
          <p className="text-sm text-red-600 font-medium mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {errorMsg}
          </p>
          <button
            onClick={() => navigate('/quizzes')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm transition-colors"
          >
            ← Back to Quizzes
          </button>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE: intro
  // ═══════════════════════════════════════════════════════════════════════════
  if (phase === 'intro') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-950 p-6">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🧠</div>
            <h1 className="text-2xl font-black text-gray-900 mb-1 break-words">{quiz?.title}</h1>
            {quiz?.description && (
              <p className="text-gray-500 text-sm leading-relaxed mt-1">{quiz.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              ['❓', total,                         'Questions'],
              ['🏆', quiz?.totalMarks,              'Total Marks'],
              ['⏱️', `${quiz?.duration}m`,          'Time Limit'],
              ['🎯', `${quiz?.passMarks} (${quiz?.passPercentage}%)`, 'Pass Marks'],
            ].map(([ic, v, l]) => (
              <div key={l} className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                <span className="text-2xl leading-none">{ic}</span>
                <p className="font-black text-gray-900 mt-1 text-sm leading-tight">{v}</p>
                <p className="text-xs text-gray-400 leading-tight">{l}</p>
              </div>
            ))}
          </div>

          {quiz?.attemptsLeft !== undefined && (
            <p className="text-center text-xs text-gray-500 mb-4 font-medium">
              Attempts remaining: <strong className="text-blue-600">{quiz.attemptsLeft}</strong> / {quiz.attemptsAllowed}
            </p>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs font-black text-amber-800 mb-2 uppercase tracking-wide">📌 Instructions</p>
            <ul className="text-xs text-amber-700 space-y-1.5 leading-snug">
              <li>• Questions are randomly shuffled every attempt</li>
              <li>• Navigate freely using Prev / Next or the question palette</li>
              <li>• Timer auto-submits when time runs out</li>
              <li>• Unanswered questions are marked as incorrect</li>
              {quiz?.negativeMarking && (
                <li className="font-bold text-red-700">
                  ⚠️ Negative marking: −{quiz.negativeMarksPerQ} mark per wrong answer
                </li>
              )}
            </ul>
          </div>

          <button
            onClick={startQuiz}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl text-lg transition-all shadow-lg hover:shadow-xl"
          >
            🚀 Begin Quiz
          </button>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE: submitting
  // ═══════════════════════════════════════════════════════════════════════════
  if (phase === 'submitting') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">📤</div>
          <p className="text-xl font-black text-gray-900">Evaluating your answers…</p>
          <p className="text-gray-500 mt-2 text-sm">Calculating score, rank and result</p>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE: quiz
  // ═══════════════════════════════════════════════════════════════════════════
  if (!q) return null   // guard: questions not loaded yet

  const qAnswered  = !!answers[q._id]?.selected
  const progPct    = total > 0 ? ((current + 1) / total) * 100 : 0

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Confirm submit dialog */}
      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={doSubmit}
        title="Submit Quiz?"
        message={
          answered < total
            ? `You've answered ${answered} of ${total} questions. The ${total - answered} unanswered will count as wrong. Submit anyway?`
            : `All ${total} questions answered. Submit your quiz now?`
        }
        confirmLabel="Yes, Submit"
      />

      {/* Sticky header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="min-w-0 flex-1">
            <p className="font-black text-gray-900 text-sm truncate">{quiz?.title}</p>
            <p className="text-xs text-gray-500">
              Question {current + 1} / {total} &nbsp;·&nbsp; {answered} answered
            </p>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <TimerDisplay seconds={timeLeft} />
            <button
              type="button"
              onClick={() => setConfirm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-black px-5 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              Submit
            </button>
          </div>
        </div>
        {/* Overall progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progPct}%` }}
          />
        </div>
      </div>

      {/* Error banner (submit retry) */}
      {errorMsg && (
        <div className="max-w-5xl mx-auto w-full px-4 pt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-semibold">
            ❌ {errorMsg}
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Question area */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

            {/* Meta badges */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="bg-blue-100 text-blue-700 text-xs font-black px-3 py-1 rounded-full">
                Q{current + 1}
              </span>
              <DiffBadge level={q.difficulty} />
              {q.category && (
                <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                  {q.category}
                </span>
              )}
              <span className="text-xs text-gray-400 ml-auto font-medium">
                {q.marks || 1} mark{(q.marks || 1) > 1 ? 's' : ''}
              </span>
            </div>

            {/* Question text */}
            <p className="text-gray-900 font-semibold text-base leading-relaxed mb-6 break-words">
              {q.question}
            </p>

            {/* Options */}
            <div className="space-y-3">
              {OPT_LABELS.map(label => {
                const text = q.options?.[label]
                if (!text) return null
                return (
                  <OptionButton
                    key={label}
                    label={label}
                    text={text}
                    selected={answers[q._id]?.selected === label}
                    onClick={() => selectAnswer(q._id, label, q._optMap)}
                  />
                )
              })}
            </div>
          </div>

          {/* Prev / Next navigation */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={prev}
              disabled={current === 0}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <span className="text-sm text-gray-500 font-medium">
              <span className="text-blue-600 font-black">{answered}</span> / {total} answered
            </span>
            <button
              type="button"
              onClick={next}
              disabled={current === total - 1}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Question palette sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sticky top-24">
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">
              Question Palette
            </p>

            <div className="grid grid-cols-5 gap-1.5 mb-4">
              {questions.map((qq, i) => (
                <PaletteDot
                  key={qq._id}
                  num={i + 1}
                  isCurrent={i === current}
                  isAnswered={!!answers[qq._id]?.selected}
                  onClick={() => goTo(i)}
                />
              ))}
            </div>

            {/* Legend */}
            <div className="space-y-1.5 text-xs mb-4">
              {[
                ['bg-blue-600',   'Current'],
                ['bg-emerald-500','Answered'],
                ['bg-gray-100 border border-gray-200', 'Not answered'],
              ].map(([cls, lbl]) => (
                <div key={lbl} className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded flex-shrink-0 ${cls}`} />
                  <span className="text-gray-500 font-medium">{lbl}</span>
                </div>
              ))}
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{answered}/{total}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: total > 0 ? `${(answered / total) * 100}%` : '0%' }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setConfirm(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-black py-3 rounded-xl transition-colors"
            >
              Submit Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
