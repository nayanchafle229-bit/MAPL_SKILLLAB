import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Home, Map, BrainCircuit, BookOpen, BarChart2, Trophy,
  User, Users, FileText, HelpCircle, GraduationCap,
  LogOut, Menu, X, LayoutDashboard
} from 'lucide-react'
import logo from '../pages/maplskill.png'

const userNav = [
  { to:'/dashboard',  icon: Home, label:'Dashboard' },
  { to:'/curriculum', icon: Map, label:'Curriculum' },
  { to:'/quizzes',    icon: BrainCircuit, label:'My Quizzes' },
  { to:'/courses',    icon: BookOpen, label:'Courses' },
  { to:'/history',    icon: BarChart2, label:'Results' },
  { to:'/portfolio',  icon: Trophy, label:'Portfolio' },
  { to:'/profile',    icon: User, label:'Profile' },
]
const adminNav = [
  { to:'/admin',                icon: LayoutDashboard, label:'Dashboard' },
  { to:'/curriculum',           icon: Map, label:'Curriculum' },
  { to:'/admin/quizzes',        icon: BrainCircuit, label:'Quizzes' },
  { to:'/admin/questions',      icon: HelpCircle, label:'Questions' },
  { to:'/admin/courses',        icon: BookOpen, label:'Courses' },
  { to:'/admin/users',          icon: Users, label:'Users' },
  { to:'/admin/results',        icon: Trophy, label:'Results' },
  { to:'/admin/case-review',    icon: FileText, label:'Case Review' },
  { to:'/progress',             icon: BarChart2, label:'Progress Tracking' },
]

const userBottomNav  = [
  { to:'/dashboard',  icon: Home, label:'Home' },
  { to:'/curriculum', icon: Map, label:'Curriculum' },
  { to:'/quizzes',    icon: BrainCircuit, label:'Quizzes' },
  { to:'/portfolio',  icon: Trophy, label:'Portfolio' },
]
const adminBottomNav = [
  { to:'/admin',           icon: LayoutDashboard, label:'Home' },
  { to:'/admin/quizzes',   icon: BrainCircuit, label:'Quizzes' },
  { to:'/admin/questions', icon: HelpCircle, label:'Questions' },
  { to:'/admin/users',     icon: Users, label:'Users' },
]

export default function Layout({ children, title }) {
  const { user, logout } = useAuth()
  const location  = useLocation()
  const navigate  = useNavigate()
  const [mob, setMob] = useState(false)

  const nav = user?.role === 'admin'
    ? adminNav
    : (user?.canViewProgress ? [...userNav, { to:'/progress', icon: BarChart2, label:'Progress Tracking' }] : userNav)
  const bottomNav = user?.role === 'admin' ? adminBottomNav : userBottomNav

  const isActive = (to) => location.pathname === to || (to !== '/admin' && to !== '/dashboard' && location.pathname.startsWith(to))

  const handleLogout = () => { logout(); navigate('/login') }

  const SidebarContent = ({ onNavigate }) => (
    <aside className="flex flex-col h-full bg-surface-card border-r border-line text-slate-300 w-64 flex-shrink-0 relative overflow-hidden">

      {/* Blueprint grid + ambient glow, control-panel backdrop */}
      <div className="absolute inset-0 blueprint-bg-fine opacity-60 pointer-events-none" />
      <div className="absolute -top-16 -left-10 w-56 h-56 bg-primary-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-10 right-0 w-40 h-40 bg-secondary-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Vertical bus rail — ladder-logic reference, runs behind nav */}
      <div className="absolute left-[27px] top-[108px] bottom-24 w-px bg-gradient-to-b from-primary-500/40 via-line to-transparent pointer-events-none z-0" />

      {/* Brand Header */}
      <div className="px-6 py-6 flex items-center justify-between relative z-10 border-b border-line">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 shadow-glow-primary ring-1 ring-white/10 bg-surface-raised flex items-center justify-center">
            <img src={logo} alt="MAPL SkillLab" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <p className="font-display font-bold text-sm gradient-text tracking-wide truncate">MAPL SkillLab</p>
            <p className="text-[10px] text-slate-500 font-mono truncate uppercase tracking-[0.15em]">Automation LMS</p>
          </div>
        </div>
        {onNavigate && (
          <button onClick={onNavigate} aria-label="Close menu"
            className="lg:hidden w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        )}
      </div>

      <div className="px-6 pt-4 pb-2 relative z-10">
        <div className={`nameplate ${user?.role==='admin' ? 'text-accent-400 border-accent-500/25 bg-accent-500/[0.06]' : 'text-primary-400 border-primary-500/25 bg-primary-500/[0.06]'}`}>
          <span className={`led-dot ${user?.role==='admin' ? 'is-live bg-accent-400 text-accent-400' : 'is-amber'}`} />
          {user?.role==='admin' ? 'ROLE: ADMINISTRATOR' : 'ROLE: STUDENT'}
        </div>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto relative z-10 custom-scrollbar">
        {nav.map(({ to, icon: Icon, label }) => {
          const active = isActive(to)
          return (
            <Link key={to} to={to} onClick={() => setMob(false)}
              className={`flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 group relative overflow-hidden ${
                active ? 'bg-gradient-to-r from-primary-600/15 to-secondary-500/5 text-primary-300 shadow-inner-glow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 hover:translate-x-0.5'
              }`}>
              {/* Rail node */}
              <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 transition-colors ${active ? 'bg-primary-400 border-primary-400 shadow-[0_0_8px_rgba(239,151,18,0.7)]' : 'bg-surface-card border-slate-700 group-hover:border-slate-500'}`} />
              {active && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-md bg-gradient-to-b from-primary-400 to-secondary-400 shadow-[0_0_8px_rgba(239,151,18,0.6)]"></div>
              )}
              <Icon size={18} className={`transition-colors ${active ? 'text-primary-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              <span className="relative z-10">{label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="px-6 py-6 relative z-10 border-t border-line">
        <div className="flex items-center gap-3 mb-4 group">
          <div className="w-10 h-10 bg-surface-raised border border-line rounded-full flex items-center justify-center text-sm font-mono font-bold text-primary-400 flex-shrink-0">
            {(user?.profile?.name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-200 truncate">{user?.profile?.name || 'User'}</p>
            <p className="text-[11px] text-slate-500 font-mono truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm text-slate-300 bg-slate-800/50 hover:bg-slate-800 border border-line hover:border-accent-500/30 hover:text-accent-300 transition-colors font-medium">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-surface-base">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <SidebarContent />
      </div>

      {/* Mobile drawer */}
      {mob && (
        <div className="fixed inset-0 z-50 lg:hidden flex page-enter">
          <div className="w-72 shadow-2xl"><SidebarContent onNavigate={() => setMob(false)} /></div>
          <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setMob(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="bg-surface-base/90 backdrop-blur-md px-4 sm:px-8 py-5 flex items-center justify-between flex-shrink-0 z-20 border-b border-line sticky top-0">
          <div className="flex items-center gap-4 min-w-0">
            <button className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-slate-800/50 border border-line text-slate-400 hover:text-slate-200 transition-colors" onClick={() => setMob(true)} aria-label="Open menu">
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-display font-semibold text-slate-100 truncate">{title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex nameplate normal-case tracking-normal text-slate-400">
              <span className="led-dot is-live" />
              Welcome, <span className="font-sans font-medium text-slate-200 not-italic">{user?.profile?.name || user?.email?.split('@')[0]}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 pb-24 lg:pb-8 z-10 custom-scrollbar relative">
          <div className="max-w-7xl mx-auto page-enter">{children}</div>
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-surface-card border-t border-line pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5 h-16">
          {bottomNav.map(({ to, icon: Icon, label }) => {
            const active = isActive(to)
            return (
              <Link key={to} to={to}
                className={`flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors relative ${
                  active ? 'text-primary-400' : 'text-slate-500 hover:text-slate-300'
                }`}>
                <Icon size={20} className={`transition-transform ${active ? 'scale-110 -translate-y-0.5' : ''}`} />
                <span className={`${active ? 'opacity-100' : 'opacity-80'}`}>{label}</span>
                {active && (
                  <div className="absolute top-0 w-8 h-0.5 rounded-b-full bg-primary-500"></div>
                )}
              </Link>
            )
          })}
          <button onClick={() => setMob(true)}
            className="flex flex-col items-center justify-center gap-1 text-[10px] font-medium text-slate-500 hover:text-slate-300 transition-colors">
            <Menu size={20} />
            <span className="opacity-80">More</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
