import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "../styles/Login.css";
import logo from "../pages/maplskill.png";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
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

          {sent ? (
            <>
              <h2>Check your email</h2>
              <p>
                If an account exists for <strong style={{ color: "#f1f5f9" }}>{email}</strong>,
                we've sent a link to reset your password. It expires in 1 hour.
              </p>
              <div className="register">
                Didn't get it? Check spam, or
                <a href="#" onClick={(e) => { e.preventDefault(); setSent(false); }}> try again</a>
              </div>
            </>
          ) : (
            <>
              <h2>Forgot Password?</h2>
              <p>No worries — enter your email and we'll send you a reset link.</p>

              {error && <div className="error-box">{error}</div>}

              <form onSubmit={submit}>
                <div className="input-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <button className="login-btn" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            </>
          )}

          <div className="register">
            Remembered your password?
            <Link to="/login"> Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
