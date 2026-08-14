import React, { useEffect, useState } from 'react'
import { Hourglass, CheckCircle2, Pencil, XCircle } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import api from '../../api/axios'
import { PageLoader, Alert } from '../../components/UI'

const STATUS_COPY = {
  pending_review: { label: 'Awaiting review', tone: 'info',    icon: <Hourglass size={18} /> },
  passed:         { label: 'Passed',          tone: 'success', icon: <CheckCircle2 size={18} /> },
  needs_revision: { label: 'Needs revision',  tone: 'warning', icon: <Pencil size={18} /> },
  failed:         { label: 'Not passed',      tone: 'error',   icon: <XCircle size={18} /> },
}

export default function CaseStudy() {
  const { id } = useParams() // quiz id
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [submission, setSubmission] = useState(undefined) // undefined = loading, null = none yet
  const [response, setResponse] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.get(`/quiz/${id}/case-study`)
      .then(({ data }) => {
        setQuiz(data.quiz)
        setSubmission(data.submission)
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load case study'))
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!response.trim()) return
    setSubmitting(true)
    setError('')
    try {
      const { data } = await api.post(`/quiz/${id}/case-study`, { response })
      setSubmission(data.submission)
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (submission === undefined && !error) return <Layout title="Case Study"><PageLoader text="Loading case study..." /></Layout>

  const status = submission && STATUS_COPY[submission.status]

  return (
    <Layout title="Case Study">
      <div className="max-w-2xl mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-black text-white">Legend Case Study</h1>
          <p className="text-sm text-slate-400 mt-1">
            You passed the scenario questions. This written case study is the final piece — a reviewer reads it and grades it by hand.
          </p>
        </div>

        {error && <Alert type="error" message={error} />}

        {quiz?.caseStudyPrompt && (
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="font-black text-white mb-3 text-lg">Prompt</h3>
            <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed font-medium">{quiz.caseStudyPrompt}</p>
          </div>
        )}

        {submission && submission.status !== 'needs_revision' ? (
          <div className="glass-panel p-6 rounded-2xl">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black mb-4 shadow-inner ${
              submission.status === 'passed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : submission.status === 'failed' ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                : 'bg-primary-500/10 text-primary-300 border border-primary-500/20'
            }`}>
              <span className="text-lg drop-shadow-sm">{status.icon}</span> <span>{status.label}</span>
            </div>
            {submission.status === 'pending_review' && (
              <p className="text-sm text-slate-400 font-medium">Your response was submitted on <strong className="text-white">{new Date(submission.submittedAt).toLocaleDateString()}</strong>. Check back once it's been reviewed — this page will update.</p>
            )}
            {submission.status === 'passed' && (
              <>
                <p className="text-sm text-slate-400 mb-4 font-medium">This module is now complete. Nice work.</p>
                <button onClick={() => navigate('/curriculum')} className="btn-primary">Back to Curriculum</button>
              </>
            )}
            {submission.reviewNotes && (
              <div className="mt-5 pt-5 border-t border-white/10">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Reviewer notes</p>
                <p className="text-sm text-slate-300 whitespace-pre-line font-medium leading-relaxed bg-white/5 p-4 rounded-xl border border-white/10">{submission.reviewNotes}</p>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl space-y-5">
            {submission?.status === 'needs_revision' && (
              <Alert type="warning" message="Your previous submission needs revision — see the reviewer notes below, then resubmit." />
            )}
            {submission?.reviewNotes && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 shadow-inner">
                <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-2">Reviewer notes</p>
                <p className="text-sm text-amber-100/70 whitespace-pre-line font-medium">{submission.reviewNotes}</p>
              </div>
            )}
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={12}
              placeholder="Write your response here..."
              className="w-full input-field resize-y"
            />
            <button type="submit" disabled={submitting || !response.trim()} className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed text-center justify-center">
              {submitting ? 'Submitting…' : 'Submit Case Study'}
            </button>
          </form>
        )}
      </div>
    </Layout>
  )
}
