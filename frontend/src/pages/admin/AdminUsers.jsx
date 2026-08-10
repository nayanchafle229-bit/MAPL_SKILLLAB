import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import Layout from '../../components/Layout'
import { PageLoader, EmptyState, ConfirmDialog, Alert } from '../../components/UI'

export default function AdminUsers() {
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [delId,   setDelId]   = useState(null)
  const [search,  setSearch]  = useState('')
  const [success, setSuccess] = useState('')

  const load = () => {
    setLoading(true)
    api.get('/admin/users').then(({ data }) => setUsers(data.users || [])).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const deleteUser = async () => {
    await api.delete(`/admin/users/${delId}`)
    setDelId(null)
    setSuccess('User deleted.')
    setTimeout(() => setSuccess(''), 2000)
    load()
  }

  const toggleProgressAccess = async (u) => {
    const nextValue = !u.canViewProgress
    await api.put(`/admin/users/${u._id}/progress-access`, { canView: nextValue })
    setSuccess(nextValue ? `${u.profile?.name || u.email} can now view student progress.` : `Progress-tracking access revoked for ${u.profile?.name || u.email}.`)
    setTimeout(() => setSuccess(''), 2500)
    load()
  }

  const filtered = users.filter(u =>
    !search ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.profile?.name?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <Layout title="Users"><PageLoader /></Layout>

  return (
    <Layout title="All Users">
      <ConfirmDialog open={!!delId} onClose={() => setDelId(null)} onConfirm={deleteUser}
        title="Delete User?" message="This will remove the user and all their quiz results permanently." confirmLabel="Delete User" danger />

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-white">👥 Users</h2>
          <p className="text-slate-400 text-sm">{users.length} registered user{users.length !== 1 ? 's' : ''}</p>
        </div>
        <input type="text" placeholder="🔍 Search users..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="input-field max-w-xs text-sm" />
      </div>

      {success && <div className="mb-4"><Alert type="success" message={success} /></div>}

      {users.length === 0 ? (
        <EmptyState icon="👥" title="No users yet" description="Users will appear here after they register." />
      ) : (
        <div className="glass-panel overflow-hidden p-0 rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                {['#', 'User', 'Branch / Year', 'Interests', 'Joined', 'Profile', 'Progress Access', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-black text-slate-400 uppercase tracking-widest px-6 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((u, i) => (
                <tr key={u._id} className="hover:bg-white/[0.05] transition-colors group">
                  <td className="px-6 py-4 text-xs text-slate-500 font-bold group-hover:text-primary-400 transition-colors">{i + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500/20 to-primary-600/20 border border-primary-500/30 rounded-xl flex items-center justify-center text-primary-300 font-black text-sm flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                        {(u.profile?.name || u.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-white group-hover:text-primary-300 transition-colors">{u.profile?.name || <span className="text-slate-500 italic">No name</span>}</p>
                        <p className="text-[10px] font-medium text-slate-400 mt-0.5">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    <div className="font-medium">{u.profile?.branch || <span className="text-slate-600">—</span>}</div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-0.5">{u.profile?.year || ''}</div>
                  </td>
                  <td className="px-6 py-4 max-w-[180px]">
                    {u.profile?.interests
                      ? <p className="text-xs text-slate-400 font-medium line-clamp-2">{u.profile.interests}</p>
                      : <span className="text-slate-600 text-xs">—</span>}
                  </td>
                  <td className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400">
                    {new Date(u.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    {u.profileComplete
                      ? <span className="text-[10px] uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-full font-black shadow-inner">Complete</span>
                      : <span className="text-[10px] uppercase tracking-widest bg-amber-500/10 text-amber-300 border border-amber-500/20 px-3 py-1.5 rounded-full font-black shadow-inner">Incomplete</span>}
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleProgressAccess(u)}
                      title="Allow this user to view other students' progress"
                      className={`text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full font-black shadow-inner transition-colors border ${u.canViewProgress ? 'bg-accent-500/10 text-accent-400 border-accent-500/30 hover:bg-accent-500/20' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}>
                      {u.canViewProgress ? '✓ Granted' : 'Grant Access'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Link to={`/progress/${u._id}`}
                        className="text-[10px] uppercase tracking-widest bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 px-3 py-1.5 rounded-lg font-black transition-colors border border-primary-500/20 shadow-inner">
                        Progress
                      </Link>
                      <button onClick={() => setDelId(u._id)}
                        className="text-[10px] uppercase tracking-widest bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-1.5 rounded-lg font-black transition-colors border border-red-500/20 shadow-inner">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <span className="text-3xl opacity-50 mb-2 block">🔍</span>
              <p className="text-slate-400 text-sm font-bold">No users match your search.</p>
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}
