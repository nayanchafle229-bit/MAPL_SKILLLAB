import React from 'react'

export function Spinner({ size='md' }) {
  const s = { sm:'w-4 h-4', md:'w-8 h-8', lg:'w-12 h-12' }[size]
  return <div className={`${s} border-4 border-primary-500/20 border-t-primary-400 rounded-full animate-spin`} />
}

export function PageLoader({ text='Loading...' }) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-primary-500/20 border-t-primary-400 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-400 font-medium">{text}</p>
      </div>
    </div>
  )
}

export function Alert({ type='error', message }) {
  if (!message) return null
  const s = {
    error:'bg-red-500/10 border-red-500/20 text-red-300',
    success:'bg-accent-500/10 border-accent-500/20 text-accent-300',
    info:'bg-primary-500/10 border-primary-500/20 text-primary-300',
    warning:'bg-amber-500/10 border-amber-500/20 text-amber-300',
  }
  const i = { error:'❌', success:'✅', info:'ℹ️', warning:'⚠️' }
  return (
    <div className={`flex items-start gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium ${s[type]}`}>
      <span className="flex-shrink-0">{i[type]}</span><span>{message}</span>
    </div>
  )
}

export function StatCard({ icon, label, value, sub, color='blue', trend }) {
  const grad = {
    blue:'from-primary-500 to-primary-600',
    green:'from-accent-500 to-accent-600',
    purple:'from-fuchsia-500 to-purple-600',
    orange:'from-orange-500 to-orange-600',
    red:'from-red-500 to-red-600',
    indigo:'from-indigo-500 to-primary-600',
  }
  return (
    <div className="card card-hover flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${grad[color]||grad.blue} flex items-center justify-center text-white text-xl flex-shrink-0 shadow-lg shadow-black/20`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-2xl font-black text-white leading-tight">{value}</p>
        <p className="text-sm font-semibold text-slate-400 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
        {trend !== undefined && (
          <p className={`text-xs font-semibold mt-1 ${trend>=0?'text-accent-400':'text-red-400'}`}>{trend>=0?'↑':'↓'} {Math.abs(trend)}% vs last</p>
        )}
      </div>
    </div>
  )
}

export function EmptyState({ icon='📭', title, description, action }) {
  return (
    <div className="text-center py-16 px-6">
      <div className="text-6xl mb-4 opacity-70">{icon}</div>
      <h3 className="text-xl font-bold text-slate-200 mb-2">{title}</h3>
      {description && <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">{description}</p>}
      {action}
    </div>
  )
}

export function Modal({ open, onClose, title, children, wide=false }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className={`bg-surface-raised border border-white/10 rounded-2xl shadow-2xl ${wide?'w-full max-w-3xl':'w-full max-w-lg'} max-h-[92vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 sticky top-0 bg-surface-raised rounded-t-2xl">
          <h2 className="text-lg font-black text-white">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-400 hover:text-slate-200 text-xl transition-colors">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel='Confirm', danger=false }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-surface-raised border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h3 className="text-lg font-black text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-slate-300 hover:bg-white/5 transition-colors">Cancel</button>
          <button onClick={onConfirm} className={`px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors ${danger?'bg-red-500 hover:bg-red-600':'bg-primary-600 hover:bg-primary-500'}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

export function ScoreRing({ score, total, size=140 }) {
  const pct  = total > 0 ? Math.round((score / total) * 100) : 0
  const r    = (size/2) - 12
  const circ = 2 * Math.PI * r
  const off  = circ - (pct / 100) * circ
  const color = pct >= 75 ? '#34d399' : pct >= 50 ? '#f59e0b' : '#f87171'
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="10" fill="none"/>
        <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth="10" fill="none"
          strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition:'stroke-dashoffset 1s ease' }}/>
      </svg>
      <div className="absolute text-center">
        <p className="text-3xl font-black text-white leading-none">{pct}%</p>
        <p className="text-xs text-slate-400 mt-1 font-semibold">{score}/{total}</p>
      </div>
    </div>
  )
}

export function DifficultyBadge({ level }) {
  const s = { easy:'bg-accent-500/15 text-accent-400 border border-accent-500/20', medium:'bg-amber-500/15 text-amber-300 border border-amber-500/20', hard:'bg-red-500/15 text-red-300 border border-red-500/20' }
  return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${s[level]||s.medium}`}>{level}</span>
}

export function PassBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black ${status==='PASS'?'bg-accent-500/15 text-accent-400 border border-accent-500/20':'bg-red-500/15 text-red-300 border border-red-500/20'}`}>
      {status==='PASS'?'✓':'✗'} {status}
    </span>
  )
}

export function RankBadge({ rank }) {
  if (rank === 1) return <span className="text-2xl" title="Rank 1">🥇</span>
  if (rank === 2) return <span className="text-2xl" title="Rank 2">🥈</span>
  if (rank === 3) return <span className="text-2xl" title="Rank 3">🥉</span>
  return <span className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-slate-300 text-sm font-black flex items-center justify-center">#{rank}</span>
}

export function ProgressBar({ value, max, color='blue', showLabel=true, height='h-3' }) {
  const pct = max > 0 ? Math.min(100, Math.round((value/max)*100)) : 0
  const cols = { blue:'bg-primary-500', green:'bg-accent-500', red:'bg-red-500', orange:'bg-orange-500', purple:'bg-fuchsia-500' }
  return (
    <div>
      {showLabel && <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5"><span>{value}</span><span>{pct}%</span></div>}
      <div className={`w-full ${height} bg-white/5 rounded-full overflow-hidden`}>
        <div className={`${height} ${cols[color]||cols.blue} rounded-full transition-all duration-700`} style={{ width:`${pct}%` }} />
      </div>
    </div>
  )
}
