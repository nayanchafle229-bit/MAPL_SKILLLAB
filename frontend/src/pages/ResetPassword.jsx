import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import "../styles/Login.css";
import logo from "../pages/maplskill.png";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setDone(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "This reset link is invalid or has expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="bg-circle circle1" />
      <div className="bg-circle circle2" />
      <div className="bg-circle circle3" />

      <div className="login-panel" style={{ position: "relative", zIndex: 5, width: "100%" }}>
        <div className="glass-card">
          <img src={logo} alt="Smart Quiz" className="login-logo" />

          {done ? (
            <>
              <h2>Password Reset!</h2>
              <p>Your password has been updated. Redirecting you to login...</p>
            </>
          ) : (
            <>
              <h2>Set New Password</h2>
              <p>Choose a new password for your account.</p>

              {error && <div className="error-box">{error}</div>}

              <form onSubmit={submit}>
                <div className="input-group">
                  <label>New Password</label>
                  <div className="password-box">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 4 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="show-btn"
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="input-group">
                  <label>Confirm Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                </div>

                <button className="login-btn" disabled={loading}>
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </>
          )}

          <div className="register">
            <Link to="/login">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
