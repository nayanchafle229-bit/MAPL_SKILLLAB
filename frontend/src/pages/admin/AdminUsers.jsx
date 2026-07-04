import React, { useState, useEffect } from 'react'
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
          <h2 className="text-2xl font-black text-gray-900">👥 Users</h2>
          <p className="text-gray-500 text-sm">{users.length} registered user{users.length !== 1 ? 's' : ''}</p>
        </div>
        <input type="text" placeholder="🔍 Search users..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="input-field max-w-xs text-sm" />
      </div>

      {success && <div className="mb-4"><Alert type="success" message={success} /></div>}

      {users.length === 0 ? (
        <EmptyState icon="👥" title="No users yet" description="Users will appear here after they register." />
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['#', 'User', 'Branch / Year', 'Interests', 'Joined', 'Profile', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((u, i) => (
                <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-xs text-gray-400 font-bold">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {(u.profile?.name || u.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{u.profile?.name || <span className="text-gray-400 italic">No name</span>}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div>{u.profile?.branch || <span className="text-gray-400">—</span>}</div>
                    <div className="text-xs text-gray-400">{u.profile?.year || ''}</div>
                  </td>
                  <td className="px-4 py-3 max-w-[180px]">
                    {u.profile?.interests
                      ? <p className="text-xs text-gray-500 line-clamp-2">{u.profile.interests}</p>
                      : <span className="text-gray-400 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    {u.profileComplete
                      ? <span className="badge-green">Complete</span>
                      : <span className="badge-yellow">Incomplete</span>}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setDelId(u._id)}
                      className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-2.5 py-1 rounded-lg font-semibold transition-colors">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">No users match your search.</div>
          )}
        </div>
      )}
    </Layout>
  )
}
