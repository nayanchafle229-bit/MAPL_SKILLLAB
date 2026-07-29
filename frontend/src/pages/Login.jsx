import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Login.css";;
import logo from "../pages/maplskill.png";;

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

      {/* Background Shapes */}

      <div className="bg-circle circle1"></div>
      <div className="bg-circle circle2"></div>
      <div className="bg-circle circle3"></div>

      <div className="login-container">

        {/* HERO */}

        <div className="hero-section">

          <div className="hero-content">

            <img
              src={logo}
              className="hero-logo"
              alt="MAPL SkillLab"
            />

            <span className="platform-badge">
              INDUSTRIAL AUTOMATION LMS
            </span>

            <h1>
              Learn Industrial Automation
              <span>Like Never Before</span>
            </h1>

            <p>
              Master DCS, PLC, SCADA, Instrumentation,
              Industrial Networking and Process Automation
              through structured learning paths designed by
              industry experts.
            </p>

            <div className="feature-list">

              <div className="feature">✓ Learn without limits</div>
              <div className="feature">✓ Knowledge on demand</div>
              <div className="feature">✓ Certificates</div>
              <div className="feature">✓ Lifetime Access</div>

            </div>

            <div className="stats">

             <div className="stat-card">
    <h2>Learning</h2>
    <span>Structured Modules</span>
</div>

<div className="stat-card">
    <h2>Practice</h2>
    <span>Hands-on Exercises</span>
</div>

<div className="stat-card">
    <h2>Assess</h2>
    <span>Knowledge Tests</span>
</div>

<div className="stat-card">
    <h2>Grow</h2>
    <span>Career Development</span>
</div>

            </div>

          </div>

         

          {/* Floating Cards */}

          

        

        </div>


        {/* LOGIN */}

        <div className="login-panel">

          <div className="glass-card">

            <img
              src={logo}
              className="login-logo"
              alt=""
            />

            <h2>Welcome Back</h2>

            <p>
              Continue your learning journey.
            </p>

            {error && (
              <div className="error-box">
                {error}
              </div>
            )}

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
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
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
                    onChange={() =>
                      setRemember(!remember)
                    }
                  />

                  Remember Me

                </label>

                <a href="#">
                  Forgot Password?
                </a>

              </div>

              <button
                className="login-btn"
                disabled={loading}
              >
                {loading
                  ? "Signing In..."
                  : "Continue Learning →"}
              </button>

            </form>

            <div className="divider">

              <span>OR</span>

            </div>

            <button className="google-btn">

              Continue with Google

            </button>

            <div className="register">

              Don't have an account?

              <Link to="/register">
                Create Account
              </Link>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}