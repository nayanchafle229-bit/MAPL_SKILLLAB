import React, { useEffect, useState } from 'react'
import { FileText, CheckCircle2, Pencil, XCircle, Circle } from 'lucide-react'
import Layout from '../../components/Layout'
import api from '../../api/axios'
import { PageLoader, EmptyState, Alert, Modal } from '../../components/UI'
import { getLevel } from '../../utils/levels'

const TABS = [
  { value: 'pending_review', label: 'Pending' },
  { value: 'passed',         label: 'Passed' },
  { value: 'needs_revision', label: 'Needs Revision' },
  { value: 'failed',         label: 'Failed' },
  { value: 'all',            label: 'All' },
]

function timeAgo(dateStr) {
  const mins = Math.round((Date.now() - new Date(dateStr)) / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.round(hrs / 24)}d ago`
}

export default function AdminCaseReview() {
  const [tab, setTab] = useState('pending_review')
  const [submissions, setSubmissions] = useState(null)
  const [error, setError] = useState('')
  const [openId, setOpenId] = useState(null)

  const load = () => {
    setSubmissions(null)
    api.get('/admin/case-submissions', { params: { status: tab } })
      .then(({ data }) => setSubmissions(data.submissions))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load submissions'))
  }

  useEffect(load, [tab])

  return (
    <Layout title="Case Study Review">
      <div className="max-w-4xl mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-black text-white">Case Study Review</h1>
          <p className="text-sm text-slate-400 mt-1">L4 written submissions awaiting a human grade.</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {TABS.map((t) => (
            <button key={t.value} onClick={() => setTab(t.value)}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                tab === t.value ? 'bg-primary-600 border-primary-500 text-white' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {error && <Alert type="error" message={error} />}

        {!submissions && !error && <PageLoader text="Loading submissions..." />}

        {submissions && submissions.length === 0 && (
          <EmptyState icon={<FileText size={48} />} title="Nothing here" description={`No submissions with status "${tab}".`} />
        )}

        {submissions && submissions.length > 0 && (
          <div className="card p-0 divide-y divide-white/5">
            {submissions.map((s) => {
              const level = getLevel(s.moduleId?.level)
              return (
                <button key={s._id} onClick={() => setOpenId(s._id)}
                  className="w-full text-left px-5 py-4 hover:bg-white/5 transition-colors flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-bold text-white truncate">
                      {s.userId?.profile?.name || s.userId?.email || 'Student'}
                    </p>
                    <p className="text-sm text-slate-400 truncate mt-0.5">
                      {s.moduleId?.title || s.quizId?.title} {s.attemptNumber > 1 && <span className="text-slate-600">· attempt {s.attemptNumber}</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {level && <span className={`text-xs font-bold px-2 py-1 rounded-full border ${level.badge}`}><Circle fill="currentColor" size={12} className={level.iconColor} /></span>}
                    <span className="text-xs text-slate-500">{timeAgo(s.submittedAt)}</span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {openId && (
        <CaseReviewModal
          id={openId}
          onClose={() => setOpenId(null)}
          onReviewed={() => { setOpenId(null); load() }}
        />
      )}
    </Layout>
  )
}

function CaseReviewModal({ id, onClose, onReviewed }) {
  const [submission, setSubmission] = useState(null)
  const [status, setStatus] = useState('passed')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/admin/case-submissions/${id}`)
      .then(({ data }) => setSubmission(data.submission))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load submission'))
  }, [id])

  const handleReview = async () => {
    setSubmitting(true)
    setError('')
    try {
      await api.put(`/admin/case-submissions/${id}/review`, { status, reviewNotes: notes })
      onReviewed()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record review')
      setSubmitting(false)
    }
  }

  return (
    <Modal open onClose={onClose} title="Review Case Study" wide>
      {!submission && !error && <PageLoader text="Loading..." />}
      {error && <Alert type="error" message={error} />}

      {submission && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 glass-panel p-4 rounded-xl border border-white/10">
            <div>
              <p className="font-black text-white text-lg">{submission.userId?.profile?.name || submission.userId?.email}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{submission.moduleId?.title}</p>
            </div>
            {submission.quizResultId && (
              <span className="text-xs font-black uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1.5 rounded-full shadow-inner text-slate-300">
                Auto-graded: <span className="text-white">{submission.quizResultId.percentage}%</span> ({submission.quizResultId.passStatus})
              </span>
            )}
          </div>

          {submission.quizId?.caseStudyPrompt && (
            <div className="glass-panel p-5 rounded-xl border border-white/10">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Prompt</p>
              <p className="text-sm text-slate-300 whitespace-pre-line bg-white/5 rounded-xl p-4 border border-white/10 font-medium leading-relaxed">
                {submission.quizId.caseStudyPrompt}
              </p>
            </div>
          )}

          <div className="glass-panel p-5 rounded-xl border border-white/10">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Response</p>
            <p className="text-sm text-slate-200 whitespace-pre-line bg-white/5 rounded-xl p-4 border border-white/10 max-h-72 overflow-y-auto font-medium leading-relaxed shadow-inner">
              {submission.response}
            </p>
          </div>

          {submission.status === 'passed' ? (
            <Alert type="success" message="This submission was already marked passed — no further action needed." />
          ) : (
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex gap-3">
                {['passed', 'needs_revision', 'failed'].map((s) => (
                  <button key={s} onClick={() => setStatus(s)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                      status === s 
                      ? 'bg-primary-500/20 border-primary-500/50 text-primary-300 scale-105' 
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:scale-105 hover:text-slate-200'
                    }`}>
                    {s === 'passed' ? <><CheckCircle2 size={14}/> Pass</> : s === 'needs_revision' ? <><Pencil size={14}/> Revise</> : <><XCircle size={14}/> Fail</>}
                  </button>
                ))}
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Notes for the student (shown to them, especially important for 'needs revision')"
                className="input-field w-full resize-y"
              />
              <button onClick={handleReview} disabled={submitting} className="btn-primary w-full disabled:opacity-50 justify-center">
                {submitting ? 'Saving…' : 'Submit Review'}
              </button>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
