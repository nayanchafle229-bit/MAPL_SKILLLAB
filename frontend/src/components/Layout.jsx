import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const userNav = [
  { to:'/dashboard',  icon:'🏠', label:'Dashboard' },
  { to:'/curriculum', icon:'🗺️', label:'Curriculum' },
  { to:'/quizzes',    icon:'🧠', label:'My Quizzes' },
  { to:'/courses',    icon:'📚', label:'Courses' },
  { to:'/history',    icon:'📊', label:'Results' },
  { to:'/portfolio',  icon:'🏆', label:'Portfolio' },
  { to:'/profile',    icon:'👤', label:'Profile' },
]
const adminNav = [
  { to:'/admin',                icon:'📈', label:'Dashboard' },
  { to:'/curriculum',           icon:'🗺️', label:'Curriculum' },
  { to:'/admin/quizzes',        icon:'🧠', label:'Quizzes' },
  { to:'/admin/questions',      icon:'❓', label:'Questions' },
  { to:'/admin/courses',        icon:'📚', label:'Courses' },
  { to:'/admin/users',          icon:'👥', label:'Users' },
  { to:'/admin/results',        icon:'🏆', label:'Results' },
  { to:'/admin/case-review',    icon:'📝', label:'Case Review' },
  { to:'/progress',             icon:'📊', label:'Progress Tracking' },
]

// Trimmed sets for the mobile bottom tab bar (max 4 + a "More" button)
const userBottomNav  = [
  { to:'/dashboard',  icon:'🏠', label:'Home' },
  { to:'/curriculum', icon:'🗺️', label:'Curriculum' },
  { to:'/quizzes',    icon:'🧠', label:'Quizzes' },
  { to:'/portfolio',  icon:'🏆', label:'Portfolio' },
]
const adminBottomNav = [
  { to:'/admin',           icon:'📈', label:'Home' },
  { to:'/admin/quizzes',   icon:'🧠', label:'Quizzes' },
  { to:'/admin/questions', icon:'❓', label:'Questions' },
  { to:'/admin/users',     icon:'👥', label:'Users' },
]

export default function Layout({ children, title }) {
  const { user, logout } = useAuth()
  const location  = useLocation()
  const navigate  = useNavigate()
  const [mob, setMob] = useState(false)
  const nav = user?.role === 'admin'
    ? adminNav
    : (user?.canViewProgress ? [...userNav, { to:'/progress', icon:'📊', label:'Progress Tracking' }] : userNav)
  const bottomNav = user?.role === 'admin' ? adminBottomNav : userBottomNav
  const isActive = (to) => location.pathname === to || (to !== '/admin' && to !== '/dashboard' && location.pathname.startsWith(to))
  const handleLogout = () => { logout(); navigate('/login') }

  const SidebarContent = ({ onNavigate }) => (
    <aside className="flex flex-col h-full bg-surface-card/40 backdrop-blur-3xl border-r border-white/5 text-white w-64 flex-shrink-0 shadow-2xl relative">
      {/* Decorative top gradient */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-primary-500/10 to-transparent pointer-events-none" />
      
      <div className="px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center text-xl shadow-[0_0_20px_-5px_rgba(6,182,212,0.5)] flex-shrink-0 relative overflow-hidden">
            <span className="relative z-10">🎓</span>
            <div className="absolute inset-0 bg-white/20 blur-sm mix-blend-overlay"></div>
          </div>
          <div className="min-w-0">
            <p className="font-black text-sm text-white tracking-wide truncate">Smart Quiz</p>
            <p className="text-xs text-slate-400 font-medium truncate uppercase tracking-widest">Platform</p>
          </div>
        </div>
        {onNavigate && (
          <button onClick={onNavigate} aria-label="Close menu"
            className="lg:hidden w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl hover:bg-white/10 text-slate-400 hover:text-white text-xl transition-colors">
            ×
          </button>
        )}
      </div>
      
      <div className="px-6 pb-4">
        <div className={`text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 ${user?.role==='admin'?'bg-red-500/10 text-red-400 border border-red-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]':'bg-primary-500/10 text-primary-400 border border-primary-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${user?.role==='admin'?'bg-red-500':'bg-primary-500'} animate-pulse`} />
          {user?.role==='admin' ? 'ADMINISTRATOR' : 'STUDENT'}
        </div>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto relative z-10 custom-scrollbar">
        {nav.map(({ to, icon, label }) => {
          const active = isActive(to)
          return (
            <Link key={to} to={to} onClick={() => setMob(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group relative overflow-hidden ${
                active ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}>
              {active && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-transparent border-l-2 border-primary-400"></div>
              )}
              <span className={`text-base w-5 text-center transition-transform duration-300 ${active ? 'scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'group-hover:scale-110'}`}>{icon}</span>
              <span className="relative z-10">{label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="px-6 py-6 relative z-10">
        <div className="glass-panel p-3 flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center text-sm font-black text-white flex-shrink-0 shadow-inner">
            {(user?.profile?.name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white truncate">{user?.profile?.name || 'User'}</p>
            <p className="text-[10px] text-slate-400 truncate uppercase tracking-wider">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm text-red-400 bg-red-500/5 hover:bg-red-500/15 hover:text-red-300 border border-red-500/10 transition-all font-bold">
          <span>🚪</span> Sign Out
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      {/* Desktop Sidebar (Floating effect) */}
      <div className="hidden lg:flex p-4 pr-0">
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/5 h-full">
          <SidebarContent />
        </div>
      </div>

      {mob && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="w-72 shadow-2xl"><SidebarContent onNavigate={() => setMob(false)} /></div>
          <div className="flex-1 bg-black/60 backdrop-blur-md" onClick={() => setMob(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="bg-transparent px-4 sm:px-8 py-6 flex items-center justify-between flex-shrink-0 z-20">
          <div className="flex items-center gap-4 min-w-0">
            <button className="lg:hidden w-11 h-11 flex items-center justify-center rounded-xl bg-surface-card/50 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors flex-shrink-0" onClick={() => setMob(true)} aria-label="Open menu">
              <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 truncate drop-shadow-sm">{title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400 bg-surface-card/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/5">
              Welcome back, <span className="font-bold text-white tracking-wide">{user?.profile?.name || user?.email?.split('@')[0]}</span>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 pb-24 lg:pb-8 z-10 custom-scrollbar relative">
          <div className="max-w-7xl mx-auto page-enter">{children}</div>
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-surface-card/80 backdrop-blur-2xl border-t border-white/5 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="grid grid-cols-5 h-16">
          {bottomNav.map(({ to, icon, label }) => {
            const active = isActive(to)
            return (
              <Link key={to} to={to}
                className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition-all duration-300 ${
                  active ? 'text-primary-400' : 'text-slate-500 hover:text-slate-300'
                }`}>
                <span className={`text-xl leading-none transition-transform duration-300 ${active ? 'scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] -translate-y-1' : ''}`}>{icon}</span>
                <span className={`${active ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
                {active && <div className="absolute bottom-0 w-8 h-1 bg-primary-500 rounded-t-full shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>}
              </Link>
            )
          })}
          <button onClick={() => setMob(true)}
            className="flex flex-col items-center justify-center gap-1 text-[10px] font-bold text-slate-500 hover:text-slate-300 transition-colors">
            <span className="text-xl leading-none">☰</span>
            <span className="opacity-70">More</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
