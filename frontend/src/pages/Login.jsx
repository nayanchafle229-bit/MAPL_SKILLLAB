import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from './maplskill.png'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const submit = async (e) => {
    e.preventDefault()

    setError('')
    setLoading(true)

    try {
      const user = await login(form.email, form.password)

      navigate(user.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Login failed. Check your credentials.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Barlow:wght@300;400;500;600&family=Barlow+Condensed:wght@700;800&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Barlow', sans-serif;
          background: #0a0e1a;
        }

        .login-root {
          min-height: 100vh;
          display: flex;
          background: #0a0e1a;
        }

        /* LEFT PANEL */

        .left-panel {
          flex: 1;
          position: relative;
          display: none;
          overflow: hidden;
          align-items: center;
          justify-content: center;
          padding: 40px;
          background: linear-gradient(
            135deg,
            #0d1425 0%,
            #111d35 50%,
            #0a1220 100%
          );
        }

        @media (min-width: 1024px) {
          .left-panel {
            display: flex;
          }
        }

        .left-panel::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(180,100,40,.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(180,100,40,.06) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
        }

        .orb-1 {
          width: 300px;
          height: 300px;
          background: rgba(180,100,36,.18);
          top: -60px;
          left: -60px;
        }

        .orb-2 {
          width: 250px;
          height: 250px;
          background: rgba(50,90,180,.18);
          bottom: -40px;
          right: -40px;
        }

        .left-content {
          position: relative;
          z-index: 2;
          text-align: center;
          max-width: 520px;
          background: rgba(255,255,255,.02);
          padding: 30px;
          border-radius: 24px;
          border: 1px solid rgba(180,100,36,.12);
          backdrop-filter: blur(10px);
        }

        .logo-img {
          width: 100%;
          max-width: 420px;
          margin-bottom: 25px;
          border-radius: 20px;
          filter:
            drop-shadow(0 10px 30px rgba(180,100,36,.25))
            brightness(1.05);
        }

        .tagline {
          font-family: 'Barlow Condensed', sans-serif;
          letter-spacing: .18em;
          text-transform: uppercase;
          color: #d4832a;
          font-size: 12px;
          margin-bottom: 30px;
        }

        .pillars {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 25px;
          flex-wrap: wrap;
        }

        .pillar {
          text-align: center;
        }

        .pillar-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          background: rgba(180,100,36,.08);
          border: 1px solid rgba(180,100,36,.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          margin: 0 auto 8px;
          color: #d4832a;
        }

        .pillar-label {
          font-size: 11px;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: #9fb0d0;
        }

        .stat-row {
          margin-top: 35px;
          display: flex;
          justify-content: center;
          gap: 40px;
          flex-wrap: wrap;
        }

        .stat {
          text-align: center;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #d4832a;
          font-family: 'Rajdhani', sans-serif;
        }

        .stat-label {
          font-size: 11px;
          color: rgba(180,200,230,.6);
          margin-top: 4px;
        }

        /* RIGHT PANEL */

        .right-panel {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px;
          background: linear-gradient(
            160deg,
            #0e1625 0%,
            #0a0e1a 60%,
            #0d1120 100%
          );
        }

        .form-card {
          width: 100%;
          max-width: 420px;
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(180,100,36,.18);
          border-radius: 24px;
          padding: 40px 32px;
          backdrop-filter: blur(20px);
          box-shadow:
            0 20px 60px rgba(0,0,0,.5),
            0 0 40px rgba(180,100,36,.05);
        }

        .mobile-logo {
          display: flex;
          justify-content: center;
          margin-bottom: 25px;
        }

        .mobile-logo img {
          width: 180px;
          border-radius: 18px;
          filter:
            drop-shadow(0 10px 30px rgba(180,100,36,.25))
            brightness(1.05);
        }

        @media (min-width: 1024px) {
          .mobile-logo {
            display: none;
          }
        }

        .form-header {
          text-align: center;
          margin-bottom: 28px;
        }

        .form-title {
          font-size: 32px;
          font-weight: 700;
          color: #eef2ff;
          font-family: 'Rajdhani', sans-serif;
        }

        .form-subtitle {
          margin-top: 6px;
          font-size: 13px;
          color: rgba(180,200,230,.55);
        }

        .accent-line {
          width: 60px;
          height: 3px;
          background: linear-gradient(90deg, #b46424, #d4832a);
          margin: 12px auto 0;
          border-radius: 999px;
        }

        .field-group {
          margin-bottom: 18px;
        }

        .field-label {
          display: block;
          margin-bottom: 8px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: .08em;
          color: rgba(180,200,230,.65);
        }

        .field-input {
          width: 100%;
          padding: 14px 16px;
          border-radius: 12px;
          border: 1px solid rgba(180,100,36,.18);
          background: rgba(255,255,255,.05);
          color: #eef2ff;
          font-size: 14px;
          outline: none;
          transition: .2s;
        }

        .field-input:focus {
          border-color: rgba(180,100,36,.6);
          box-shadow: 0 0 0 3px rgba(180,100,36,.12);
        }

        .field-input::placeholder {
          color: rgba(180,200,230,.3);
        }

        .alert-error {
          background: rgba(220,50,50,.1);
          border: 1px solid rgba(220,50,50,.25);
          color: #ff9090;
          padding: 12px;
          border-radius: 10px;
          margin-bottom: 16px;
          font-size: 13px;
        }

        .btn-signin {
          width: 100%;
          border: none;
          border-radius: 12px;
          padding: 14px;
          background: linear-gradient(
            135deg,
            #b46424 0%,
            #d4832a 50%,
            #b46424 100%
          );
          color: white;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: .08em;
          text-transform: uppercase;
          cursor: pointer;
          transition: .2s;
          margin-top: 6px;
        }

        .btn-signin:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(180,100,36,.35);
        }

        .btn-signin:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        .form-footer {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,.06);
          text-align: center;
        }

        .form-footer p {
          color: rgba(180,200,230,.55);
          font-size: 13px;
        }

        .form-footer a {
          color: #d4832a;
          text-decoration: none;
          font-weight: 600;
        }

        .form-footer a:hover {
          text-decoration: underline;
        }

        .admin-hint {
          margin-top: 18px;
          padding: 12px;
          border-radius: 10px;
          background: rgba(180,100,36,.07);
          border: 1px solid rgba(180,100,36,.2);
          text-align: center;
        }

        .admin-hint p {
          color: rgba(220,180,120,.75);
          font-size: 12px;
        }

        .admin-hint code {
          background: rgba(180,100,36,.14);
          padding: 2px 6px;
          border-radius: 4px;
          color: #d4832a;
        }
      `}</style>

      <div className="login-root">

        {/* LEFT SIDE */}
        <div className="left-panel">

          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>

          <div className="left-content">

            <img
              src={logo}
              alt="MAPL SkillLab"
              className="logo-img"
            />

            <div className="tagline">
              DCS TRAINING & LEARNING PLATFORM
            </div>

            <div className="pillars">

              <div className="pillar">
                <div className="pillar-icon">📘</div>
                <div className="pillar-label">Learn</div>
              </div>

              <div className="pillar">
                <div className="pillar-icon">⚙️</div>
                <div className="pillar-label">Practice</div>
              </div>

              <div className="pillar">
                <div className="pillar-icon">🎛️</div>
                <div className="pillar-label">Control</div>
              </div>

              <div className="pillar">
                <div className="pillar-icon">📈</div>
                <div className="pillar-label">Grow</div>
              </div>

            </div>

            <div className="stat-row">

              <div className="stat">
                <div className="stat-value"></div>
                <div className="stat-label"></div>
              </div>

              <div className="stat">
                <div className="stat-value"></div>
                <div className="stat-label"></div>
              </div>

              <div className="stat">
                <div className="stat-value"></div>
                <div className="stat-label">Access</div>
              </div>

            </div>

          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="right-panel">

          <div className="form-card">

            <div className="mobile-logo">
              <img src={logo} alt="MAPL SkillLab" />
            </div>

            <div className="form-header">

              <div className="form-title">
                Welcome Back
              </div>

              <div className="form-subtitle">
                Sign in to your MAPL SkillLab account
              </div>

              <div className="accent-line"></div>

            </div>

            <form onSubmit={submit}>

              <div className="field-group">

                <label className="field-label">
                  Email / Username
                </label>

                <input
                  type="text"
                  name="email"
                  value={form.email}
                  onChange={handle}
                  placeholder="you@mapl.com"
                  required
                  className="field-input"
                />

              </div>

              <div className="field-group">

                <label className="field-label">
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handle}
                  placeholder="••••••••"
                  required
                  className="field-input"
                />

              </div>

              {error && (
                <div className="alert-error">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-signin"
              >
                {loading ? '⏳ Authenticating...' : 'Sign In →'}
              </button>

            </form>

            <div className="form-footer">

              <p>
                Don&apos;t have an account?{' '}
                <Link to="/register">
                  Create one free
                </Link>
              </p>

            </div>

            <div className="admin-hint">

              <p>
              <code></code>  <code></code>
              </p>

            </div>

          </div>

        </div>

      </div>
    </>
  )
}