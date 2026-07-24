import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthHero from '../components/AuthHero'
import '../styles/Login.css'
import logo from './maplskill.png'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

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
    <div className="login-page">
      <div className="bg-circle circle1" />
      <div className="bg-circle circle2" />
      <div className="bg-circle circle3" />

      <div className="login-container">
        <AuthHero />

        <div className="login-panel">
          <div className="glass-card">
            <img src={logo} className="login-logo" alt="" />
            <h2>Create Account</h2>
            <p className="subtitle">Join MAPL SkillLab and start learning today.</p>

            {error && <div className="error-box">{error}</div>}

            <form onSubmit={submit}>
              <div className="input-group">
                <label htmlFor="reg-email">Email</label>
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handle}
                  placeholder="you@example.com"
                  autoComplete="username"
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="reg-password">Password</label>
                <div className="password-box">
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handle}
                    placeholder="Min. 4 characters"
                    autoComplete="new-password"
                    required
                  />
                  <button type="button" className="show-btn" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="reg-confirm">Confirm Password</label>
                <input
                  id="reg-confirm"
                  type={showPassword ? 'text' : 'password'}
                  name="confirm"
                  value={form.confirm}
                  onChange={handle}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  required
                />
              </div>

              <button className="login-btn" disabled={loading} style={{ marginTop: 4 }}>
                {loading ? 'Creating…' : 'Create Account →'}
              </button>
            </form>

            <div className="login-link">
              Already have an account?
              <Link to="/login">Sign In</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
