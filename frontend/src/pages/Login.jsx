import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthHero from '../components/AuthHero'
import '../styles/Login.css'
import logo from './maplskill.png'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [remember, setRemember] = useState(true)

  const handle = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      navigate(user.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.')
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
            <h2>Welcome Back</h2>
            <p className="subtitle">Continue your learning journey.</p>

            {error && <div className="error-box">{error}</div>}

            <form onSubmit={submit}>
              <div className="input-group">
                <label htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  type="text"
                  name="email"
                  value={form.email}
                  onChange={handle}
                  placeholder="Enter email"
                  autoComplete="username"
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="login-password">Password</label>
                <div className="password-box">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handle}
                    placeholder="Password"
                    autoComplete="current-password"
                    required
                  />
                  <button type="button" className="show-btn" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="login-options">
                <label>
                  <input type="checkbox" checked={remember} onChange={() => setRemember(!remember)} />
                  Stay signed in
                </label>
                <span className="hint">Trouble signing in? Contact your admin.</span>
              </div>

              <button className="login-btn" disabled={loading}>
                {loading ? 'Signing In…' : 'Continue Learning →'}
              </button>
            </form>

            <div className="register">
              Don't have an account?
              <Link to="/register">Create Account</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
