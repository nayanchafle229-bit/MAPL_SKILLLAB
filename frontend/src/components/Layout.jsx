import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  IconHome, IconBrain, IconBook, IconChart, IconTrophy, IconUser,
  IconTrending, IconHelp, IconUsers, IconAward, IconLogout, IconMenu,
} from './Icons'

const userNav = [
  { to: '/dashboard', Icon: IconHome,   label: 'Dashboard' },
  { to: '/quizzes',   Icon: IconBrain,  label: 'My Quizzes' },
  { to: '/courses',   Icon: IconBook,   label: 'Courses' },
  { to: '/history',   Icon: IconChart,  label: 'Results' },
  { to: '/portfolio', Icon: IconTrophy, label: 'Portfolio' },
  { to: '/profile',   Icon: IconUser,   label: 'Profile' },
]
const adminNav = [
  { to: '/admin',           Icon: IconTrending, label: 'Dashboard' },
  { to: '/admin/quizzes',   Icon: IconBrain,     label: 'Quizzes' },
  { to: '/admin/questions', Icon: IconHelp,      label: 'Questions' },
  { to: '/admin/courses',   Icon: IconBook,      label: 'Courses' },
  { to: '/admin/users',     Icon: IconUsers,     label: 'Users' },
  { to: '/admin/results',   Icon: IconAward,     label: 'Results' },
]

export default function Layout({ children, title }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mob, setMob] = useState(false)
  const nav = user?.role === 'admin' ? adminNav : userNav
  const handleLogout = () => { logout(); navigate('/login') }

  const SidebarContent = () => (
    <aside className="flex flex-col h-full bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white w-64 flex-shrink-0 shadow-2xl">
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-glow flex-shrink-0">
            <IconBrain className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-white tracking-tight truncate">MAPL SkillLab</p>
            <p className="text-[11px] text-slate-400 truncate">Evaluation System</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-2.5 border-b border-white/10">
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide px-3 py-1 rounded-full ring-1 ${
          user?.role === 'admin'
            ? 'bg-rose-500/15 text-rose-300 ring-rose-500/25'
            : 'bg-primary-500/15 text-primary-300 ring-primary-500/25'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${user?.role === 'admin' ? 'bg-rose-400' : 'bg-primary-400'}`} />
          {user?.role === 'admin' ? 'ADMINISTRATOR' : 'STUDENT'}
        </span>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {nav.map(({ to, Icon, label }) => {
          const active = location.pathname === to || (to !== '/admin' && to !== '/dashboard' && location.pathname.startsWith(to))
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setMob(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                active ? 'bg-primary-600 text-white shadow-glow' : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
              {label}
              {active && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
            </Link>
          )
        })}
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow">
            {(user?.profile?.name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.profile?.name || 'User'}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-rose-500/15 hover:text-rose-300 transition-all font-medium"
        >
          <IconLogout className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      <div className="hidden lg:flex"><SidebarContent /></div>

      {mob && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="w-64 animate-scale-in origin-left"><SidebarContent /></div>
          <div className="flex-1 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMob(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white/90 backdrop-blur-md border-b border-gray-200/80 px-6 py-4 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
              onClick={() => setMob(true)}
              aria-label="Open menu"
            >
              <IconMenu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
              Welcome, <span className="font-semibold text-gray-900">{user?.profile?.name || user?.email?.split('@')[0]}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto page-enter">{children}</div>
        </main>
      </div>
    </div>
  )
}
