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
    <aside className="flex flex-col h-full bg-surface-card/40 backdrop-blur-3xl border-r border-white/5 text-white w-64 flex-shrink-0 shadow-2xl relative overflow-hidden">
      {/* Decorative animated gradient stripe at top */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-primary-500 via-secondary-400 to-accent-500 opacity-60" style={{ backgroundSize: '200% 100%', animation: 'gradientShift 4s ease infinite' }} />
      
      {/* Decorative radial glow */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-primary-500/8 to-transparent pointer-events-none" />
      
      {/* Subtle noise texture */}
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")"
      }} />
      
      <div className="px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center text-xl shadow-[0_0_20px_-5px_rgba(6,182,212,0.5)] flex-shrink-0 relative overflow-hidden glow-ring group">
            <span className="relative z-10 group-hover:scale-110 transition-transform duration-300">🎓</span>
            <div className="absolute inset-0 bg-white/20 blur-sm mix-blend-overlay"></div>
          </div>
          <div className="min-w-0">
            <p className="font-black text-sm text-white tracking-wide truncate">Smart Quiz</p>
            <p className="text-[10px] text-slate-500 font-medium truncate uppercase tracking-[0.2em]">Platform</p>
          </div>
        </div>
        {onNavigate && (
          <button onClick={onNavigate} aria-label="Close menu"
            className="lg:hidden w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl hover:bg-white/10 text-slate-400 hover:text-white hover:rotate-90 text-xl transition-all duration-300">
            ×
          </button>
        )}
      </div>
      
      <div className="px-6 pb-4">
        <div className={`text-[10px] font-black tracking-[0.2em] uppercase px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 ${user?.role==='admin'?'bg-red-500/10 text-red-400 border border-red-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]':'bg-primary-500/10 text-primary-400 border border-primary-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${user?.role==='admin'?'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]':'bg-primary-500 shadow-[0_0_6px_rgba(139,92,246,0.8)]'} animate-pulse`} />
          {user?.role==='admin' ? 'ADMINISTRATOR' : 'STUDENT'}
        </div>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto relative z-10 custom-scrollbar">
        {nav.map(({ to, icon, label }, idx) => {
          const active = isActive(to)
          return (
            <Link key={to} to={to} onClick={() => setMob(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group relative overflow-hidden ${
                active ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              style={{ animationDelay: `${idx * 30}ms` }}>
              {active && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500/15 to-transparent"></div>
                  <div className="absolute left-0 top-[15%] bottom-[15%] w-[3px] rounded-r-full bg-gradient-to-b from-primary-400 to-secondary-400 shadow-[0_0_12px_rgba(139,92,246,0.6)]"></div>
                </>
              )}
              <span className={`text-base w-5 text-center transition-all duration-300 ${active ? 'scale-110 drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]' : 'group-hover:scale-110 group-hover:drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]'}`}>{icon}</span>
              <span className="relative z-10">{label}</span>
              {/* Hover shimmer */}
              {!active && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />}
            </Link>
          )
        })}
      </nav>

      <div className="px-6 py-6 relative z-10">
        <div className="glass-panel p-3 flex items-center gap-3 mb-4 group hover:border-white/10 transition-all duration-300">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center text-sm font-black text-white flex-shrink-0 shadow-inner group-hover:shadow-[0_0_12px_rgba(139,92,246,0.4)] transition-shadow duration-300">
            {(user?.profile?.name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white truncate">{user?.profile?.name || 'User'}</p>
            <p className="text-[10px] text-slate-500 truncate uppercase tracking-wider">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm text-red-400 bg-red-500/5 hover:bg-red-500/15 hover:text-red-300 border border-red-500/10 hover:border-red-500/20 transition-all font-bold hover:-translate-y-0.5">
          <span>🚪</span> Sign Out
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex p-4 pr-0">
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/5 h-full">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile drawer */}
      {mob && (
        <div className="fixed inset-0 z-50 lg:hidden flex animate-fade-in">
          <div className="w-72 shadow-2xl animate-slide-right"><SidebarContent onNavigate={() => setMob(false)} /></div>
          <div className="flex-1 bg-black/60 backdrop-blur-md" onClick={() => setMob(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="bg-transparent px-4 sm:px-8 py-6 flex items-center justify-between flex-shrink-0 z-20">
          <div className="flex items-center gap-4 min-w-0">
            <button className="lg:hidden w-11 h-11 flex items-center justify-center rounded-xl bg-surface-card/50 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all flex-shrink-0 hover:border-primary-500/30" onClick={() => setMob(true)} aria-label="Open menu">
              <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="text-2xl font-black gradient-text-alt truncate">{title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400 bg-surface-card/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/5 hover:border-white/10 transition-colors">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
              Welcome, <span className="font-bold text-white tracking-wide">{user?.profile?.name || user?.email?.split('@')[0]}</span>
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
                className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition-all duration-300 relative ${
                  active ? 'text-primary-400' : 'text-slate-500 hover:text-slate-300'
                }`}>
                <span className={`text-xl leading-none transition-all duration-300 ${active ? 'scale-110 drop-shadow-[0_0_8px_rgba(139,92,246,0.8)] -translate-y-1' : ''}`}>{icon}</span>
                <span className={`${active ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
                {active && (
                  <div className="absolute bottom-0 w-8 h-1 rounded-t-full bg-gradient-to-r from-primary-500 to-secondary-400 shadow-[0_0_10px_rgba(139,92,246,0.8)]"></div>
                )}
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
