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
    green:'from-emerald-500 to-emerald-600',
    purple:'from-accent-500 to-accent-600',
    orange:'from-amber-500 to-amber-600',
    red:'from-red-500 to-red-600',
    indigo:'from-primary-600 to-accent-600',
  }
  const shadow = {
    blue: 'shadow-primary-500/20',
    green: 'shadow-emerald-500/20',
    purple: 'shadow-accent-500/20',
    orange: 'shadow-amber-500/20',
    red: 'shadow-red-500/20',
    indigo: 'shadow-primary-500/20',
  }
  return (
    <div className="glass-panel p-6 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex items-start gap-5 relative overflow-hidden group">
      {/* Decorative background glow */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${grad[color]||grad.blue} rounded-full opacity-20 blur-2xl group-hover:opacity-30 transition-opacity`} />
      
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${grad[color]||grad.blue} flex items-center justify-center text-white text-2xl flex-shrink-0 shadow-lg ${shadow[color]||shadow.blue} relative z-10`}>
        {icon}
      </div>
      <div className="min-w-0 relative z-10 flex-1">
        <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 leading-tight drop-shadow-sm">{value}</p>
        <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-wider">{label}</p>
        {sub && <p className="text-xs text-slate-500 mt-1 font-medium">{sub}</p>}
        {trend !== undefined && (
          <p className={`text-xs font-bold mt-1.5 flex items-center gap-1 ${trend>=0?'text-emerald-400':'text-red-400'}`}>
            <span className={`flex items-center justify-center w-4 h-4 rounded-full ${trend>=0?'bg-emerald-500/20':'bg-red-500/20'}`}>
              {trend>=0?'↑':'↓'}
            </span>
            {Math.abs(trend)}% vs last
          </p>
        )}
      </div>
    </div>
  )
}

export function EmptyState({ icon='📭', title, description, action }) {
  return (
    <div className="glass-panel text-center py-20 px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
      <div className="text-7xl mb-6 opacity-80 drop-shadow-xl animate-pulse">{icon}</div>
      <h3 className="text-2xl font-black text-white mb-3 tracking-wide">{title}</h3>
      {description && <p className="text-sm text-slate-400 mb-8 max-w-md mx-auto font-medium leading-relaxed">{description}</p>}
      <div className="flex justify-center">{action}</div>
    </div>
  )
}

export function Modal({ open, onClose, title, children, wide=false }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className={`bg-surface-card border border-white/10 rounded-3xl shadow-2xl ${wide?'w-full max-w-3xl':'w-full max-w-lg'} max-h-[92vh] flex flex-col relative overflow-hidden animate-fade-in`}>
        {/* Glow behind modal header */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-primary-500/10 to-transparent pointer-events-none" />
        
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 relative z-10">
          <h2 className="text-xl font-black text-white tracking-wide">{title}</h2>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 text-xl transition-colors shadow-inner">×</button>
        </div>
        <div className="p-8 overflow-y-auto custom-scrollbar relative z-10">{children}</div>
      </div>
    </div>
  )
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel='Confirm', danger=false }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-surface-card border border-white/10 rounded-3xl shadow-2xl w-full max-w-sm p-8 relative overflow-hidden animate-fade-in">
        <div className={`absolute top-0 inset-x-0 h-32 bg-gradient-to-b ${danger?'from-red-500/10':'from-primary-500/10'} to-transparent pointer-events-none`} />
        
        <div className="relative z-10">
          <h3 className="text-xl font-black text-white mb-3">{title}</h3>
          <p className="text-sm text-slate-400 mb-8 leading-relaxed font-medium">{message}</p>
          <div className="flex gap-4 justify-end">
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-white/10 text-sm font-bold text-slate-300 hover:bg-white/10 transition-colors shadow-inner">Cancel</button>
            <button onClick={onConfirm} className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 ${danger?'bg-red-500 hover:bg-red-400 shadow-red-500/20':'bg-primary-600 hover:bg-primary-500 shadow-primary-500/20'}`}>{confirmLabel}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ScoreRing({ score, total, size=160 }) {
  const pct  = total > 0 ? Math.round((score / total) * 100) : 0
  const r    = (size/2) - 16
  const circ = 2 * Math.PI * r
  const off  = circ - (pct / 100) * circ
  const color = pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444'
  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Outer glow based on score */}
      <div className="absolute inset-0 rounded-full opacity-20 blur-xl" style={{ backgroundColor: color }}></div>
      <svg width={size} height={size} className="-rotate-90 relative z-10 drop-shadow-md">
        <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.05)" strokeWidth="14" fill="none"/>
        <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth="14" fill="none"
          strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition:'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)' }}/>
      </svg>
      <div className="absolute text-center z-10">
        <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 leading-none drop-shadow-sm">{pct}%</p>
        <p className="text-xs text-slate-500 mt-2 font-bold tracking-widest uppercase">{score}/{total} pts</p>
      </div>
    </div>
  )
}

export function DifficultyBadge({ level }) {
  const s = { easy:'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20', medium:'bg-amber-500/15 text-amber-300 border border-amber-500/20', hard:'bg-red-500/15 text-red-300 border border-red-500/20' }
  return <span className={`inline-flex px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] ${s[level]||s.medium}`}>{level}</span>
}

export function PassBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] ${status==='PASS'?'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30':'bg-red-500/15 text-red-400 border border-red-500/30'}`}>
      <span className={`w-2 h-2 rounded-full ${status==='PASS'?'bg-emerald-400':'bg-red-400'}`}></span>
      {status}
    </span>
  )
}

export function RankBadge({ rank }) {
  if (rank === 1) return <span className="text-3xl drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]" title="Rank 1">🥇</span>
  if (rank === 2) return <span className="text-3xl drop-shadow-[0_0_15px_rgba(156,163,175,0.6)]" title="Rank 2">🥈</span>
  if (rank === 3) return <span className="text-3xl drop-shadow-[0_0_15px_rgba(180,83,9,0.6)]" title="Rank 3">🥉</span>
  return <span className="w-10 h-10 rounded-full bg-white/5 border border-white/10 text-slate-300 text-sm font-black flex items-center justify-center shadow-inner">#{rank}</span>
}

export function ProgressBar({ value, max, color='blue', showLabel=true, height='h-2' }) {
  const pct = max > 0 ? Math.min(100, Math.round((value/max)*100)) : 0
  const cols = { blue:'bg-primary-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]', green:'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]', red:'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]', orange:'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)]', purple:'bg-accent-500 shadow-[0_0_10px_rgba(139,92,246,0.6)]' }
  return (
    <div>
      {showLabel && <div className="flex justify-between text-[10px] uppercase tracking-widest font-black text-slate-400 mb-2"><span>{value}</span><span className="text-slate-300">{pct}%</span></div>}
      <div className={`w-full ${height} bg-black/40 rounded-full overflow-hidden shadow-inner border border-white/5 p-px`}>
        <div className={`h-full rounded-full transition-all duration-1000 ease-out ${cols[color]||cols.blue}`} style={{ width:`${pct}%` }} />
      </div>
    </div>
  )
}
