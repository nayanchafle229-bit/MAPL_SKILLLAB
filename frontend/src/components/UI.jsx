import React, { useEffect, useRef, useState } from 'react'

/* ═══════════════════════════════════════════
   Spinner — Animated loading ring
   ═══════════════════════════════════════════ */
export function Spinner({ size='md' }) {
  const s = { sm:'w-4 h-4', md:'w-8 h-8', lg:'w-12 h-12' }[size]
  return <div className={`${s} border-4 border-primary-500/20 border-t-primary-400 rounded-full animate-spin`} />
}


/* ═══════════════════════════════════════════
   PageLoader — Full-page shimmer skeleton
   ═══════════════════════════════════════════ */
export function PageLoader({ text='Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      {/* Orbiting dots loader */}
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary-500 animate-spin" />
        <div className="absolute inset-1 rounded-full border-2 border-transparent border-r-secondary-400 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
        <div className="absolute inset-2.5 rounded-full border-2 border-transparent border-b-accent-400 animate-spin" style={{ animationDuration: '2s' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
        </div>
      </div>
      <p className="text-sm text-slate-400 font-medium animate-pulse">{text}</p>
      {/* Skeleton shimmer bars */}
      <div className="mt-8 w-full max-w-xs space-y-3">
        <div className="shimmer-loader h-3 w-full" />
        <div className="shimmer-loader h-3 w-4/5" />
        <div className="shimmer-loader h-3 w-3/5" />
      </div>
    </div>
  )
}


/* ═══════════════════════════════════════════
   Alert — Animated feedback messages
   ═══════════════════════════════════════════ */
export function Alert({ type='error', message }) {
  if (!message) return null
  const s = {
    error:'bg-red-500/10 border-red-500/20 text-red-300',
    success:'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
    info:'bg-primary-500/10 border-primary-500/20 text-primary-300',
    warning:'bg-amber-500/10 border-amber-500/20 text-amber-300',
  }
  const i = { error:'❌', success:'✅', info:'ℹ️', warning:'⚠️' }
  return (
    <div className={`flex items-start gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium animate-slide-down ${s[type]}`}>
      <span className="flex-shrink-0">{i[type]}</span><span>{message}</span>
    </div>
  )
}


/* ═══════════════════════════════════════════
   StatCard — Animated stats with hover tilt
   ═══════════════════════════════════════════ */
export function StatCard({ icon, label, value, sub, color='blue', trend }) {
  const grad = {
    blue:'from-primary-500 to-primary-600',
    green:'from-emerald-500 to-emerald-600',
    purple:'from-accent-500 to-accent-600',
    orange:'from-amber-500 to-amber-600',
    red:'from-red-500 to-red-600',
    indigo:'from-primary-600 to-accent-600',
  }
  const glowColor = {
    blue: 'rgba(139, 92, 246, 0.15)',
    green: 'rgba(16, 185, 129, 0.15)',
    purple: 'rgba(236, 72, 153, 0.15)',
    orange: 'rgba(245, 158, 11, 0.15)',
    red: 'rgba(239, 68, 68, 0.15)',
    indigo: 'rgba(139, 92, 246, 0.15)',
  }
  return (
    <div className="glass-panel p-6 hover-tilt card-hover flex items-start gap-5 relative overflow-hidden group">
      {/* Decorative gradient glow */}
      <div 
        className={`absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br ${grad[color]||grad.blue} rounded-full opacity-0 blur-3xl group-hover:opacity-20 transition-all duration-700`} 
      />
      {/* Subtle grid pattern inside card */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      />
      
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${grad[color]||grad.blue} flex items-center justify-center text-white text-2xl flex-shrink-0 shadow-lg relative z-10 group-hover:scale-110 transition-transform duration-500`}>
        {icon}
      </div>
      <div className="min-w-0 relative z-10 flex-1">
        <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 leading-tight drop-shadow-sm number-pop">{value}</p>
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


/* ═══════════════════════════════════════════
   EmptyState — Beautiful empty illustrations
   ═══════════════════════════════════════════ */
export function EmptyState({ icon='📭', title, description, action }) {
  return (
    <div className="glass-panel text-center py-20 px-8 relative overflow-hidden particles-bg">
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
      <div className="text-7xl mb-6 opacity-80 drop-shadow-xl animate-float relative z-10">{icon}</div>
      <h3 className="text-2xl font-black text-white mb-3 tracking-wide relative z-10">{title}</h3>
      {description && <p className="text-sm text-slate-400 mb-8 max-w-md mx-auto font-medium leading-relaxed relative z-10">{description}</p>}
      <div className="flex justify-center relative z-10">{action}</div>
    </div>
  )
}


/* ═══════════════════════════════════════════
   Modal — Animated with backdrop blur
   ═══════════════════════════════════════════ */
export function Modal({ open, onClose, title, children, wide=false }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div 
        onClick={e => e.stopPropagation()}
        className={`bg-surface-card border border-white/10 rounded-3xl shadow-2xl ${wide?'w-full max-w-3xl':'w-full max-w-lg'} max-h-[92vh] flex flex-col relative overflow-hidden animate-scale-in`}>
        {/* Glow behind modal header */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-primary-500/10 to-transparent pointer-events-none" />
        
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 relative z-10">
          <h2 className="text-xl font-black text-white tracking-wide">{title}</h2>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 hover:rotate-90 text-xl transition-all duration-300 shadow-inner">×</button>
        </div>
        <div className="p-8 overflow-y-auto custom-scrollbar relative z-10">{children}</div>
      </div>
    </div>
  )
}


/* ═══════════════════════════════════════════
   ConfirmDialog — Animated confirmation
   ═══════════════════════════════════════════ */
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel='Confirm', danger=false }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-surface-card border border-white/10 rounded-3xl shadow-2xl w-full max-w-sm p-8 relative overflow-hidden animate-scale-in">
        <div className={`absolute top-0 inset-x-0 h-32 bg-gradient-to-b ${danger?'from-red-500/10':'from-primary-500/10'} to-transparent pointer-events-none`} />
        
        <div className="relative z-10">
          {/* Animated icon */}
          <div className={`w-14 h-14 rounded-2xl ${danger ? 'bg-red-500/10 border border-red-500/20' : 'bg-primary-500/10 border border-primary-500/20'} flex items-center justify-center text-2xl mx-auto mb-4 animate-scale-in`}>
            {danger ? '⚠️' : '❓'}
          </div>
          <h3 className="text-xl font-black text-white mb-3 text-center">{title}</h3>
          <p className="text-sm text-slate-400 mb-8 leading-relaxed font-medium text-center">{message}</p>
          <div className="flex gap-4 justify-end">
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-white/10 text-sm font-bold text-slate-300 hover:bg-white/10 transition-all shadow-inner hover:-translate-y-0.5">Cancel</button>
            <button onClick={onConfirm} className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 ${danger?'bg-red-500 hover:bg-red-400 shadow-red-500/20':'bg-primary-600 hover:bg-primary-500 shadow-primary-500/20'}`}>{confirmLabel}</button>
          </div>
        </div>
      </div>
    </div>
  )
}


/* ═══════════════════════════════════════════
   ScoreRing — Animated circular progress
   ═══════════════════════════════════════════ */
export function ScoreRing({ score, total, size=160 }) {
  const pct  = total > 0 ? Math.round((score / total) * 100) : 0
  const r    = (size/2) - 16
  const circ = 2 * Math.PI * r
  const off  = circ - (pct / 100) * circ
  const color = pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444'
  
  return (
    <div className="relative inline-flex items-center justify-center group">
      {/* Animated outer glow */}
      <div className="absolute inset-0 rounded-full opacity-20 blur-xl animate-glow-pulse" style={{ backgroundColor: color }}></div>
      
      {/* Decorative orbiting dot */}
      <div className="absolute inset-[-8px] animate-orbit opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
      </div>
      
      <svg width={size} height={size} className="-rotate-90 relative z-10 drop-shadow-md">
        <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.05)" strokeWidth="14" fill="none"/>
        <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth="14" fill="none"
          strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition:'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)', filter: `drop-shadow(0 0 6px ${color}40)` }}/>
      </svg>
      <div className="absolute text-center z-10">
        <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 leading-none drop-shadow-sm number-pop">{pct}%</p>
        <p className="text-xs text-slate-500 mt-2 font-bold tracking-widest uppercase">{score}/{total} pts</p>
      </div>
    </div>
  )
}


/* ═══════════════════════════════════════════
   DifficultyBadge — Subtle glow badges
   ═══════════════════════════════════════════ */
export function DifficultyBadge({ level }) {
  const s = { 
    easy:'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20', 
    medium:'bg-amber-500/15 text-amber-300 border border-amber-500/20', 
    hard:'bg-red-500/15 text-red-300 border border-red-500/20' 
  }
  const glow = { easy: 'emerald', medium: 'amber', hard: 'red' }
  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] hover:shadow-${glow[level]||'amber'}-500/20 transition-shadow ${s[level]||s.medium}`}>
      {level === 'easy' && '⚡ '}{level === 'medium' && '🔥 '}{level === 'hard' && '💀 '}{level}
    </span>
  )
}


/* ═══════════════════════════════════════════
   PassBadge — Animated pass/fail indicator
   ═══════════════════════════════════════════ */
export function PassBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] ${status==='PASS'?'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30':'bg-red-500/15 text-red-400 border border-red-500/30'}`}>
      <span className={`w-2 h-2 rounded-full animate-pulse ${status==='PASS'?'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.6)]':'bg-red-400 shadow-[0_0_6px_rgba(239,68,68,0.6)]'}`}></span>
      {status}
    </span>
  )
}


/* ═══════════════════════════════════════════
   RankBadge — Animated medal badges
   ═══════════════════════════════════════════ */
export function RankBadge({ rank }) {
  if (rank === 1) return <span className="text-3xl drop-shadow-[0_0_15px_rgba(250,204,21,0.6)] animate-float" title="Rank 1">🥇</span>
  if (rank === 2) return <span className="text-3xl drop-shadow-[0_0_15px_rgba(156,163,175,0.6)] animate-float" style={{animationDelay:'0.5s'}} title="Rank 2">🥈</span>
  if (rank === 3) return <span className="text-3xl drop-shadow-[0_0_15px_rgba(180,83,9,0.6)] animate-float" style={{animationDelay:'1s'}} title="Rank 3">🥉</span>
  return <span className="w-10 h-10 rounded-full bg-white/5 border border-white/10 text-slate-300 text-sm font-black flex items-center justify-center shadow-inner hover:bg-white/10 transition-colors">#{rank}</span>
}


/* ═══════════════════════════════════════════
   ProgressBar — Animated with glow trail
   ═══════════════════════════════════════════ */
export function ProgressBar({ value, max, color='blue', showLabel=true, height='h-2' }) {
  const pct = max > 0 ? Math.min(100, Math.round((value/max)*100)) : 0
  const cols = { 
    blue:'bg-primary-500', 
    green:'bg-emerald-500', 
    red:'bg-red-500', 
    orange:'bg-amber-500', 
    purple:'bg-accent-500' 
  }
  const glows = {
    blue: 'rgba(139,92,246,0.6)',
    green: 'rgba(16,185,129,0.6)',
    red: 'rgba(239,68,68,0.6)',
    orange: 'rgba(245,158,11,0.6)',
    purple: 'rgba(236,72,153,0.6)',
  }
  return (
    <div>
      {showLabel && <div className="flex justify-between text-[10px] uppercase tracking-widest font-black text-slate-400 mb-2"><span>{value}</span><span className="text-slate-300">{pct}%</span></div>}
      <div className={`w-full ${height} bg-black/40 rounded-full overflow-hidden shadow-inner border border-white/5 p-px`}>
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-out ${cols[color]||cols.blue} relative`} 
          style={{ width:`${pct}%` }}
        >
          {/* Glowing tip */}
          <div 
            className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
            style={{ 
              backgroundColor: glows[color] || glows.blue,
              boxShadow: `0 0 10px ${glows[color] || glows.blue}`,
              opacity: pct > 3 ? 1 : 0 
            }} 
          />
        </div>
      </div>
    </div>
  )
}
