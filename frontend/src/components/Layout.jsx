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
    <aside className="flex flex-col h-full bg-surface-card/95 backdrop-blur-xl border-r border-white/10 text-white w-64 flex-shrink-0 shadow-2xl">
      <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-primary-500/30 flex-shrink-0">🎓</div>
          <div className="min-w-0">
            <p className="font-black text-sm text-white truncate">Smart Quiz</p>
            <p className="text-xs text-slate-400 truncate">Evaluation System</p>
          </div>
        </div>
        {onNavigate && (
          <button onClick={onNavigate} aria-label="Close menu"
            className="lg:hidden w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl hover:bg-white/10 text-slate-400 hover:text-white text-xl transition-colors">
            ×
          </button>
        )}
      </div>
      <div className="px-4 py-2.5 border-b border-white/10">
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${user?.role==='admin'?'bg-red-500/15 text-red-300 border border-red-500/25':'bg-primary-500/15 text-primary-300 border border-primary-500/25'}`}>
          {user?.role==='admin' ? '🔴 ADMINISTRATOR' : '🟢 STUDENT'}
        </span>
      </div>
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {nav.map(({ to, icon, label }) => {
          const active = isActive(to)
          return (
            <Link key={to} to={to} onClick={() => setMob(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                active ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/25' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}>
              <span className="text-base w-5 text-center">{icon}</span>
              {label}
              {active && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
            </Link>
          )
        })}
      </nav>
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0 shadow">
            {(user?.profile?.name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.profile?.name || 'User'}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-red-500/20 hover:text-red-300 transition-all font-medium">
          <span>🚪</span> Sign Out
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-surface-base">
      <div className="hidden lg:flex"><SidebarContent /></div>
      {mob && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="w-64"><SidebarContent onNavigate={() => setMob(false)} /></div>
          <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setMob(false)} />
        </div>
      )}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-surface-card/80 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button className="lg:hidden w-11 h-11 flex items-center justify-center rounded-xl hover:bg-white/5 active:bg-white/10 transition-colors flex-shrink-0" onClick={() => setMob(true)} aria-label="Open menu">
              <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="text-lg font-black text-white truncate">{title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400">
              Welcome, <span className="font-bold text-white">{user?.profile?.name || user?.email?.split('@')[0]}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 lg:pb-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-surface-card/95 backdrop-blur-xl border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5 h-16">
          {bottomNav.map(({ to, icon, label }) => {
            const active = isActive(to)
            return (
              <Link key={to} to={to}
                className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors ${
                  active ? 'text-primary-400' : 'text-slate-500'
                }`}>
                <span className={`text-lg leading-none ${active ? 'scale-110' : ''} transition-transform`}>{icon}</span>
                {label}
              </Link>
            )
          })}
          <button onClick={() => setMob(true)}
            className="flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold text-slate-500 active:text-primary-400 transition-colors">
            <span className="text-lg leading-none">☰</span>
            More
          </button>
        </div>
      </nav>
    </div>
  )
}
