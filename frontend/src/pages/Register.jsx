import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Alert } from '../components/UI'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]     = useState({ email: '', password: '', confirm: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (form.password.length < 4) { setError('Password must be at least 4 characters'); return }
    setLoading(true)
    try {
      await register(form.email, form.password)
      navigate('/profile')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-card via-primary-900 to-indigo-900 p-6">
      <div className="w-full max-w-md">
        <div className="bg-surface-raised rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">🎓</div>
            <h2 className="text-2xl font-black text-white">Create account</h2>
            <p className="text-slate-400 text-sm mt-1">Join the Smart Learning Platform</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Email address</label>
              <input name="email" type="email" placeholder="you@example.com"
                value={form.email} onChange={handle} required className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Password</label>
              <input name="password" type="password" placeholder="Min. 4 characters"
                value={form.password} onChange={handle} required className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Confirm Password</label>
              <input name="confirm" type="password" placeholder="Repeat your password"
                value={form.confirm} onChange={handle} required className="input-field" />
            </div>

            {error && <Alert type="error" message={error} />}

            <button type="submit" disabled={loading} className="btn-primary w-full text-base py-3">
              {loading ? '⏳ Creating...' : 'Create Account →'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-sm text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-400 font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
