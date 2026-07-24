import React from 'react'
import { IconCheck, IconInfo, IconAlertTriangle, IconInbox, IconMedal } from './Icons'

/* ══════════════════════════════════════════════════════════════
   Shared UI primitives — names/props kept IDENTICAL to the
   original file so every page that imports these keeps working.
   Only the internal markup/styling changed.
   ══════════════════════════════════════════════════════════════ */

export function Spinner({ size = 'md' }) {
  const s = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }[size]
  return <div className={`${s} border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin`} />
}

export function PageLoader({ text = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500 font-medium">{text}</p>
      </div>
    </div>
  )
}

export function Alert({ type = 'error', message }) {
  if (!message) return null
  const s = {
    error:   'bg-rose-50 border-rose-200 text-rose-700',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    info:    'bg-primary-50 border-primary-200 text-primary-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
  }
  const icons = {
    error: <IconAlertTriangle className="w-4 h-4" />,
    success: <IconCheck className="w-4 h-4" />,
    info: <IconInfo className="w-4 h-4" />,
    warning: <IconAlertTriangle className="w-4 h-4" />,
  }
  return (
    <div className={`flex items-start gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium ${s[type]}`}>
      <span className="flex-shrink-0 mt-0.5">{icons[type]}</span><span>{message}</span>
    </div>
  )
}

export function StatCard({ icon, label, value, sub, color = 'blue', trend }) {
  const grad = {
    blue: 'from-primary-500 to-primary-600',
    green: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-rose-500 to-rose-600',
    indigo: 'from-indigo-500 to-indigo-600',
  }
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 flex items-start gap-4 hover:shadow-card-hover transition-shadow duration-200">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${grad[color] || grad.blue} flex items-center justify-center text-white text-xl flex-shrink-0 shadow-sm`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
        <p className="text-sm font-semibold text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        {trend !== undefined && (
          <p className={`text-xs font-semibold mt-1 ${trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last
          </p>
        )}
      </div>
    </div>
  )
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="text-center py-16 px-6">
      <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-500 flex items-center justify-center mx-auto mb-4">
        {typeof icon === 'string' || icon === undefined
          ? <IconInbox className="w-7 h-7" />
          : icon}
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto leading-relaxed">{description}</p>}
      {action}
    </div>
  )
}

export function Modal({ open, onClose, title, children, wide = false }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-[fadeSlideIn_0.15s_ease-out]">
      <div className={`bg-white rounded-2xl shadow-2xl ring-1 ring-gray-200/60 ${wide ? 'w-full max-w-3xl' : 'w-full max-w-lg'} max-h-[92vh] overflow-y-auto animate-scale-in`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 text-xl transition-colors" aria-label="Close">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl ring-1 ring-gray-200/60 w-full max-w-sm p-6 animate-scale-in">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${danger ? 'bg-rose-50 text-rose-600' : 'bg-primary-50 text-primary-600'}`}>
          <IconAlertTriangle className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors ${danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-primary-600 hover:bg-primary-700'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export function ScoreRing({ score, total, size = 140 }) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0
  const r = (size / 2) - 12
  const circ = 2 * Math.PI * r
  const off = circ - (pct / 100) * circ
  const color = pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444'
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#e5e7eb" strokeWidth="10" fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth="10" fill="none"
          strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-3xl font-bold text-gray-900 leading-none">{pct}%</p>
        <p className="text-xs text-gray-500 mt-1 font-semibold">{score}/{total}</p>
      </div>
    </div>
  )
}

export function DifficultyBadge({ level }) {
  const s = {
    easy: 'bg-emerald-50 text-emerald-700 ring-emerald-500/15',
    medium: 'bg-amber-50 text-amber-700 ring-amber-500/15',
    hard: 'bg-rose-50 text-rose-700 ring-rose-500/15',
  }
  return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ring-1 ${s[level] || s.medium}`}>{level}</span>
}

export function PassBadge({ status }) {
  const pass = status === 'PASS'
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ring-1 ${
      pass ? 'bg-emerald-50 text-emerald-700 ring-emerald-500/15' : 'bg-rose-50 text-rose-700 ring-rose-500/15'
    }`}>
      {pass ? <IconCheck className="w-3 h-3" /> : '✗'} {status}
    </span>
  )
}

export function RankBadge({ rank }) {
  const medalColor = { 1: 'text-amber-400', 2: 'text-slate-400', 3: 'text-orange-400' }[rank]
  if (medalColor) {
    return <IconMedal className={`w-7 h-7 ${medalColor}`} title={`Rank ${rank}`} />
  }
  return <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 text-sm font-bold flex items-center justify-center">#{rank}</span>
}

export function ProgressBar({ value, max, color = 'blue', showLabel = true, height = 'h-3' }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  const cols = { blue: 'bg-primary-500', green: 'bg-emerald-500', red: 'bg-rose-500', orange: 'bg-orange-500', purple: 'bg-purple-500' }
  return (
    <div>
      {showLabel && <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1.5"><span>{value}</span><span>{pct}%</span></div>}
      <div className={`w-full ${height} bg-gray-100 rounded-full overflow-hidden`}>
        <div className={`${height} ${cols[color] || cols.blue} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
