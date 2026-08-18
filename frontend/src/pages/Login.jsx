import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Login.css";
import logo from "../pages/maplskill.png";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remember, setRemember] = useState(false);

  const handle = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const user = await login(form.email, form.password);

      navigate(user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* Blueprint grid backdrop */}
      <div className="grid-overlay"></div>
      <div className="vignette"></div>

      <div className="login-container">

        {/* HERO — Control room console */}
        <div className="hero-section">
          <div className="hero-content">

            <div className="brand-row">
              <img src={logo} className="hero-logo" alt="MAPL SkillLab" />
              <div className="status-plate">
                <span className="dot"></span>
                SYSTEM STATUS: ONLINE
              </div>
            </div>

            <span className="platform-badge">
              ▍INDUSTRIAL AUTOMATION LMS
            </span>

            <h1>
              Master the Plant Floor,
              <span>One Loop at a Time.</span>
            </h1>

            <p>
              Structured, hands-on training in PLC programming, SCADA,
              DCS, Instrumentation and Industrial Networking —
              built by practicing automation engineers.
            </p>

            {/* Live signal trace — signature element */}
            <div className="trace-panel">
              <div className="trace-label">
                <span>LIVE PROGRESS SIGNAL</span>
                <span className="trace-value">STABLE</span>
              </div>
              <svg viewBox="0 0 400 60" className="trace-svg" preserveAspectRatio="none">
                <line x1="0" y1="15" x2="400" y2="15" className="trace-grid" />
                <line x1="0" y1="30" x2="400" y2="30" className="trace-grid" />
                <line x1="0" y1="45" x2="400" y2="45" className="trace-grid" />
                <path
                  d="M0,42 L20,42 L20,20 L45,20 L45,35 L70,35 L70,10 L95,10 L95,30 L125,30 L125,15 L155,15 L155,38 L185,38 L185,22 L215,22 L215,8 L245,8 L245,28 L280,28 L280,18 L315,18 L315,32 L350,32 L350,12 L400,12"
                  className="trace-path"
                  fill="none"
                />
              </svg>
            </div>

            <div className="feature-list">
              <div className="feature"><span className="feature-led"></span>Learn without limits</div>
              <div className="feature"><span className="feature-led"></span>Knowledge on demand</div>
              <div className="feature"><span className="feature-led"></span>Certificates</div>
              <div className="feature"><span className="feature-led"></span>Lifetime Access</div>
            </div>

            <div className="stats">
              <div className="stat-card">
                <span className="stat-tag">MOD-01</span>
                <h2>Learning</h2>
                <span>Structured Modules</span>
              </div>
              <div className="stat-card">
                <span className="stat-tag">MOD-02</span>
                <h2>Practice</h2>
                <span>Hands-on Exercises</span>
              </div>
              <div className="stat-card">
                <span className="stat-tag">MOD-03</span>
                <h2>Assess</h2>
                <span>Knowledge Tests</span>
              </div>
              <div className="stat-card">
                <span className="stat-tag">MOD-04</span>
                <h2>Grow</h2>
                <span>Career Development</span>
              </div>
            </div>

          </div>
        </div>

        {/* LOGIN — Panel insert */}
        <div className="login-panel">
          <div className="glass-card">
            <span className="rivet rivet-tl"></span>
            <span className="rivet rivet-tr"></span>
            <span className="rivet rivet-bl"></span>
            <span className="rivet rivet-br"></span>

            <div className="auth-plate">
              <span className="dot"></span>
              AUTH-01 · SECURE ACCESS
            </div>

            <img src={logo} className="login-logo" alt="" />

            <h2>Welcome Back</h2>
            <p>Continue your learning journey.</p>

            {error && <div className="error-box">{error}</div>}

            <form onSubmit={submit}>
              <div className="input-group">
                <label>Email</label>
                <input
                  type="text"
                  name="email"
                  value={form.email}
                  onChange={handle}
                  placeholder="Enter email"
                  required
                />
              </div>

              <div className="input-group">
                <label>Password</label>
                <div className="password-box">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handle}
                    placeholder="Password"
                    required
                  />
                  <button
                    type="button"
                    className="show-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="login-options">
                <label>
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={() => setRemember(!remember)}
                  />
                  Remember Me
                </label>

                <Link to="/forgot-password">Forgot Password?</Link>
              </div>

              <button className="login-btn" disabled={loading}>
                <span className="switch-nub"></span>
                {loading ? "Signing In..." : "Continue Learning →"}
              </button>
            </form>

            <div className="divider"><span>OR</span></div>

            <button className="google-btn">Continue with Google</button>

            <div className="register">
              Don't have an account?
              <Link to="/register">Create Account</Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
