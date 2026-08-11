import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  Home, Map, BrainCircuit, BookOpen, BarChart2, Trophy, 
  User, Users, FileText, HelpCircle, GraduationCap, 
  LogOut, Menu, X, LayoutDashboard
} from 'lucide-react'

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
    <aside className="flex flex-col h-full bg-[#181a20] border-r border-slate-800/60 text-slate-300 w-64 flex-shrink-0 relative overflow-hidden">
      
      {/* Brand Header */}
      <div className="px-6 py-6 flex items-center justify-between relative z-10 border-b border-slate-800/60">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
            <GraduationCap size={24} />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-slate-100 tracking-wide truncate">Smart Quiz</p>
            <p className="text-[10px] text-slate-500 font-medium truncate uppercase tracking-[0.1em]">Platform</p>
          </div>
        </div>
        {onNavigate && (
          <button onClick={onNavigate} aria-label="Close menu"
            className="lg:hidden w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        )}
      </div>
      
      <div className="px-6 pt-4 pb-2">
        <div className={`text-[10px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded-md flex items-center gap-2 ${user?.role==='admin'?'bg-red-500/10 text-red-400 border border-red-500/20':'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${user?.role==='admin'?'bg-red-500':'bg-indigo-500'}`} />
          {user?.role==='admin' ? 'ADMINISTRATOR' : 'STUDENT'}
        </div>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto relative z-10 custom-scrollbar">
        {nav.map(({ to, icon: Icon, label }) => {
          const active = isActive(to)
          return (
            <Link key={to} to={to} onClick={() => setMob(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group relative ${
                active ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}>
              {active && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-md bg-indigo-500"></div>
              )}
              <Icon size={18} className={`transition-colors ${active ? 'text-indigo-500' : 'text-slate-500 group-hover:text-slate-300'}`} />
              <span className="relative z-10">{label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="px-6 py-6 relative z-10 border-t border-slate-800/60">
        <div className="flex items-center gap-3 mb-4 group">
          <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-sm font-bold text-slate-300 flex-shrink-0">
            {(user?.profile?.name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-200 truncate">{user?.profile?.name || 'User'}</p>
            <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm text-slate-300 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 transition-colors font-medium">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f1115]">
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
        <header className="bg-[#0f1115]/90 backdrop-blur-md px-4 sm:px-8 py-5 flex items-center justify-between flex-shrink-0 z-20 border-b border-slate-800/60 sticky top-0">
          <div className="flex items-center gap-4 min-w-0">
            <button className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors" onClick={() => setMob(true)} aria-label="Open menu">
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-100 truncate">{title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400 bg-slate-800/30 px-3 py-1.5 rounded-full border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Welcome, <span className="font-medium text-slate-200">{user?.profile?.name || user?.email?.split('@')[0]}</span>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 pb-24 lg:pb-8 z-10 custom-scrollbar relative">
          <div className="max-w-7xl mx-auto page-enter">{children}</div>
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#181a20] border-t border-slate-800/60 pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5 h-16">
          {bottomNav.map(({ to, icon: Icon, label }) => {
            const active = isActive(to)
            return (
              <Link key={to} to={to}
                className={`flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors relative ${
                  active ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
                }`}>
                <Icon size={20} className={`transition-transform ${active ? 'scale-110 -translate-y-0.5' : ''}`} />
                <span className={`${active ? 'opacity-100' : 'opacity-80'}`}>{label}</span>
                {active && (
                  <div className="absolute top-0 w-8 h-0.5 rounded-b-full bg-indigo-500"></div>
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
