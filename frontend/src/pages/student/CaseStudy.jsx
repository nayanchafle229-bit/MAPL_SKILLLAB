import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import api from '../../api/axios'
import { PageLoader, Alert } from '../../components/UI'

const STATUS_COPY = {
  pending_review: { label: 'Awaiting review', tone: 'info',    icon: '⏳' },
  passed:         { label: 'Passed',          tone: 'success', icon: '✅' },
  needs_revision: { label: 'Needs revision',  tone: 'warning', icon: '✏️' },
  failed:         { label: 'Not passed',      tone: 'error',   icon: '❌' },
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
          <div className="card">
            <h3 className="font-bold text-white mb-2">Prompt</h3>
            <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{quiz.caseStudyPrompt}</p>
          </div>
        )}

        {submission && submission.status !== 'needs_revision' ? (
          <div className="card">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold mb-3 ${
              submission.status === 'passed' ? 'bg-accent-500/15 text-accent-400 border border-accent-500/25'
                : submission.status === 'failed' ? 'bg-red-500/15 text-red-300 border border-red-500/25'
                : 'bg-primary-500/15 text-primary-300 border border-primary-500/25'
            }`}>
              {status.icon} {status.label}
            </div>
            {submission.status === 'pending_review' && (
              <p className="text-sm text-slate-400">Your response was submitted on {new Date(submission.submittedAt).toLocaleDateString()}. Check back once it's been reviewed — this page will update.</p>
            )}
            {submission.status === 'passed' && (
              <>
                <p className="text-sm text-slate-400 mb-3">This module is now complete. Nice work.</p>
                <button onClick={() => navigate('/curriculum')} className="btn-primary">Back to Curriculum</button>
              </>
            )}
            {submission.reviewNotes && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Reviewer notes</p>
                <p className="text-sm text-slate-300 whitespace-pre-line">{submission.reviewNotes}</p>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card space-y-4">
            {submission?.status === 'needs_revision' && (
              <Alert type="warning" message="Your previous submission needs revision — see the reviewer notes below, then resubmit." />
            )}
            {submission?.reviewNotes && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                <p className="text-xs font-bold text-amber-400 uppercase tracking-wide mb-1">Reviewer notes</p>
                <p className="text-sm text-slate-300 whitespace-pre-line">{submission.reviewNotes}</p>
              </div>
            )}
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={12}
              placeholder="Write your response here..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50 resize-y"
            />
            <button type="submit" disabled={submitting || !response.trim()} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? 'Submitting…' : 'Submit Case Study'}
            </button>
          </form>
        )}
      </div>
    </Layout>
  )
}
