import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import Layout from '../components/Layout'
import { Alert } from '../components/UI'
import { IconUser, IconInfo } from '../components/Icons'

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
    branch: '',
    year: '',
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
        // NOTE: these two were previously missing from the form entirely.
        // The backend's PUT /user/profile always overwrites the whole
        // profile object, so every save was silently resetting branch/year
        // to '' even though the Admin Users table and Portfolio page both
        // display them.
        branch: user.profile.branch || '',
        year: user.profile.year || '',
        interests: user.profile.interests || '',
        bio: user.profile.bio || '',
        phone: user.profile.phone || '',
      })
    }
  }, [user])

  const handle = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
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
      setSuccess('Profile saved successfully!')
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
        <h2 className="flex items-center gap-2 text-2xl font-black text-gray-900">
          <IconUser className="w-6 h-6 text-primary-600" />
          {isNew ? 'Complete your profile' : 'Edit Profile'}
        </h2>
        <p className="text-gray-500 mt-1">
          {isNew
            ? 'Fill in your details to get started with the platform.'
            : 'Update your profile information.'}
        </p>
      </div>

      {isNew && (
        <div className="flex items-start gap-2.5 mb-6 p-4 bg-primary-50 border border-primary-200 rounded-2xl">
          <IconInfo className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
          <p className="text-primary-700 text-sm font-medium">
            Profile setup required before accessing the platform.
          </p>
        </div>
      )}

      <div className="card">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center text-2xl font-black text-white">
            {(form.name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-gray-900">{form.name || 'Your Name'}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            {form.role && <span className="badge-blue mt-1">{form.role}</span>}
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
              <input name="name" value={form.name} onChange={handle} required placeholder="e.g. Ashish Pawar" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
              <input name="phone" value={form.phone} onChange={handle} placeholder="e.g. +91 **********" className="input-field" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Branch / Department</label>
              <input name="branch" value={form.branch} onChange={handle} placeholder="e.g. Instrumentation, Electrical" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Year / Experience</label>
              <input name="year" value={form.year} onChange={handle} placeholder="e.g. 2nd Year, 3 yrs experience" className="input-field" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Engineering Role</label>
            <select name="role" value={form.role} onChange={handle} className="input-field">
              <option value="">Select role</option>
              {ENGINEERING_ROLES.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Interests / Skills</label>
            <input name="interests" value={form.interests} onChange={handle} placeholder="e.g. PLC, SCADA, Automation" className="input-field" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Short Bio</label>
            <textarea name="bio" value={form.bio} onChange={handle} rows={3} placeholder="Tell us a bit about yourself..." className="input-field resize-none" />
          </div>

          {error && <Alert type="error" message={error} />}
          {success && <Alert type="success" message={success} />}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1 py-3 text-base">
              {loading ? 'Saving...' : isNew ? 'Save & Continue →' : 'Update Profile'}
            </button>
            {!isNew && (
              <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary">Cancel</button>
            )}
          </div>
        </form>
      </div>
    </div>
  )

  // If no profile yet, show without layout sidebar
  if (isNew) {
    return <div className="min-h-screen bg-surface-50 p-6">{inner}</div>
  }

  return <Layout title="Profile">{inner}</Layout>
}
