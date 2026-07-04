import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const userNav = [
  { to:'/dashboard',  icon:'🏠', label:'Dashboard' },
  { to:'/quizzes',    icon:'🧠', label:'My Quizzes' },
  { to:'/courses',    icon:'📚', label:'Courses' },
  { to:'/history',    icon:'📊', label:'Results' },
  { to:'/portfolio',  icon:'🏆', label:'Portfolio' },
  { to:'/profile',    icon:'👤', label:'Profile' },
]
const adminNav = [
  { to:'/admin',                icon:'📈', label:'Dashboard' },
  { to:'/admin/quizzes',        icon:'🧠', label:'Quizzes' },
  { to:'/admin/questions',      icon:'❓', label:'Questions' },
  { to:'/admin/courses',        icon:'📚', label:'Courses' },
  { to:'/admin/users',          icon:'👥', label:'Users' },
  { to:'/admin/results',        icon:'🏆', label:'Results' },
]

export default function Layout({ children, title }) {
  const { user, logout } = useAuth()
  const location  = useLocation()
  const navigate  = useNavigate()
  const [mob, setMob] = useState(false)
  const nav = user?.role === 'admin' ? adminNav : userNav
  const handleLogout = () => { logout(); navigate('/login') }

  const SidebarContent = () => (
    <aside className="flex flex-col h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white w-64 flex-shrink-0 shadow-2xl">
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-xl shadow-lg">🎓</div>
          <div>
            <p className="font-black text-sm text-white">Smart Quiz</p>
            <p className="text-xs text-slate-400">Evaluation System</p>
          </div>
        </div>
      </div>
      <div className="px-4 py-2.5 border-b border-white/10">
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${user?.role==='admin'?'bg-red-500/20 text-red-300 border border-red-500/30':'bg-blue-500/20 text-blue-300 border border-blue-500/30'}`}>
          {user?.role==='admin' ? '🔴 ADMINISTRATOR' : '🟢 STUDENT'}
        </span>
      </div>
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {nav.map(({ to, icon, label }) => {
          const active = location.pathname === to || (to !== '/admin' && to !== '/dashboard' && location.pathname.startsWith(to))
          return (
            <Link key={to} to={to} onClick={() => setMob(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'text-slate-300 hover:bg-white/10 hover:text-white'
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
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0 shadow">
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
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <div className="hidden lg:flex"><SidebarContent /></div>
      {mob && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="w-64"><SidebarContent /></div>
          <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setMob(false)} />
        </div>
      )}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white/95 backdrop-blur border-b border-gray-200/80 px-6 py-4 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors" onClick={() => setMob(true)}>
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-black text-gray-900">{title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
              Welcome, <span className="font-bold text-gray-900">{user?.profile?.name || user?.email?.split('@')[0]}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}
