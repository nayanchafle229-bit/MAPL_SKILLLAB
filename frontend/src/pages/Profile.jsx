import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Hand, Pencil, CheckCircle2, AlertTriangle, Hourglass } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import Layout from '../components/Layout'
import { Alert } from '../components/UI'

const ENGINEERING_ROLES = [
  'Trainee Engineer',
  'Project Engineer',
  'Senior Engineer',
  'Team Lead',
]

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    role: '',
    interests: '',
    bio: '',
    phone: '',
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user?.profile) {
      setForm({
        name: user.profile.name || '',
        role: user.profile.role || '',
        interests: user.profile.interests || '',
        bio: user.profile.bio || '',
        phone: user.profile.phone || '',
      })
    }
  }, [user])

  const handle = (e) => {
    setForm((f) => ({
      ...f,
      [e.target.name]: e.target.value,
    }))
  }

  const submit = async (e) => {
    e.preventDefault()

    setError('')
    setSuccess('')

    if (!form.name.trim()) {
      setError('Name is required')
      return
    }

    setLoading(true)

    try {
      await api.put('/user/profile', form)
      await refreshUser()

      setSuccess(<span className="flex items-center gap-2">Profile saved successfully! <CheckCircle2 size={16} /></span>)

      setTimeout(() => navigate('/dashboard'), 1200)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  const isNew = !user?.profileComplete

  const inner = (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-white">
          {isNew ? <span className="flex items-center gap-2"><Hand size={28} /> Complete your profile</span> : <span className="flex items-center gap-2"><Pencil size={28} /> Edit Profile</span>}
        </h2>

        <p className="text-slate-400 mt-1">
          {isNew
            ? 'Fill in your details to get started with the platform.'
            : 'Update your profile information.'}
        </p>
      </div>

      {isNew && (
        <div className="mb-6 p-4 bg-primary-500/10 border border-primary-500/20 rounded-2xl">
          <p className="text-primary-300 text-sm font-medium flex items-center gap-2">
            <AlertTriangle size={16} /> Profile setup required before accessing the platform.
          </p>
        </div>
      )}

      <div className="card">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center text-2xl font-black text-white">
            {(form.name || user?.email || 'U')[0].toUpperCase()}
          </div>

          <div>
            <p className="font-bold text-white">
              {form.name || 'Your Name'}
            </p>

            <p className="text-sm text-slate-400">{user?.email}</p>

            <span className="badge-blue mt-1">
              {form.role || 'Engineer'}
            </span>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                Full Name *
              </label>

              <input
                name="name"
                value={form.name}
                onChange={handle}
                required
                placeholder="e.g. Nayan chafale"
                className="input-field"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                Phone
              </label>

              <input
                name="phone"
                value={form.phone}
                onChange={handle}
                placeholder="e.g. +91 **********"
                className="input-field"
              />
            </div>
          </div>

          {/* Engineering Role */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">
              Engineering Role
            </label>

            <select
              name="role"
              value={form.role}
              onChange={handle}
              className="input-field"
            >
              <option value="">Select role</option>

              {ENGINEERING_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">
              Interests / Skills
            </label>

            <input
              name="interests"
              value={form.interests}
              onChange={handle}
              placeholder="e.g. PLC, SCADA, Automation, React"
              className="input-field"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">
              Short Bio
            </label>

            <textarea
              name="bio"
              value={form.bio}
              onChange={handle}
              rows={3}
              placeholder="Tell us a bit about yourself..."
              className="input-field resize-none"
            />
          </div>

          {error && <Alert type="error" message={error} />}
          {success && <Alert type="success" message={success} />}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 py-3 text-base"
            >
              {loading
                ? <span className="flex items-center justify-center gap-2"><Hourglass size={16} /> Saving...</span>
                : isNew
                ? 'Save & Continue →'
                : 'Update Profile'}
            </button>

            {!isNew && (
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn-secondary"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )

  // If no profile yet, show without layout sidebar
  if (isNew) {
    return (
      <div className="min-h-screen bg-surface-base p-6">
        {inner}
      </div>
    )
  }

  return <Layout title="Profile">{inner}</Layout>
}