import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Award, Hourglass } from 'lucide-react'
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
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{
      background: 'radial-gradient(circle at 30% 20%, rgba(139,92,246,0.12), transparent 50%), radial-gradient(circle at 70% 80%, rgba(6,182,212,0.08), transparent 50%), #0B0C10'
    }}>
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)'
      }} />
      
      {/* Floating gradient blobs */}
      <div className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-primary-500/15 rounded-full blur-[120px] animate-blob" />
      <div className="absolute -bottom-32 -right-32 w-[350px] h-[350px] bg-secondary-500/10 rounded-full blur-[120px] animate-blob" style={{ animationDelay: '3s' }} />
      
      <div className="w-full max-w-md relative z-10">
        <div className="bg-surface-card/80 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-white/5 relative overflow-hidden animate-slide-up gradient-border">
          {/* Top glow */}
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-primary-500/8 to-transparent pointer-events-none" />
          
          <div className="text-center mb-8 relative z-10">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_-5px_rgba(139,92,246,0.5)] animate-float"><Award size={28} className="text-white" /></div>
            <h2 className="text-2xl font-black text-white">Create account</h2>
            <p className="text-slate-400 text-sm mt-1">Join the Smart Learning Platform</p>
          </div>

          <form onSubmit={submit} className="space-y-4 relative z-10">
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
              {loading ? <span className="flex items-center justify-center gap-2"><Hourglass size={16} /> Creating...</span> : 'Create Account →'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center relative z-10">
            <p className="text-sm text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-400 font-semibold hover:underline hover:text-primary-300 transition-colors">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
