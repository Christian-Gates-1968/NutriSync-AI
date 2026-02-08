import React, { useState } from "react";
import { useAuth } from "context/AuthContext";
import logoo from "../../logoo.png";

export default function AuthPage() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!name.trim()) { setError("Name is required"); setLoading(false); return; }
        await register(name.trim(), email, password, role);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const roleInfo = {
    patient: { icon: "🧑‍💻", label: "Patient", desc: "Track your meals, health, & AI analysis" },
    doctor: { icon: "🩺", label: "Nutritionist / Doctor", desc: "View assigned patient data & AI audits" },
  };

  return (
    <div className="nutrisync-login-page">
      <div className="nutrisync-login-bg-glow" />
      <div className="nutrisync-login-card" style={{ maxWidth: 440 }}>
        <img src={logoo} alt="NutriSync AI" className="nutrisync-login-logo" />
        <h1 className="nutrisync-login-title">NutriSync AI</h1>
        <p className="nutrisync-login-subtitle">
          {isLogin ? "Welcome back" : "Create your account"}
        </p>

        <form className="nutrisync-login-form" onSubmit={handleSubmit}>
          {/* Name — only on Register */}
          {!isLogin && (
            <div className="nutrisync-login-field">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Dr. Jane Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="nutrisync-login-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="nutrisync-login-field">
            <label>Password</label>
            <input
              type="password"
              placeholder={isLogin ? "Enter your password" : "Min. 6 characters"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          {/* Role picker — only on Register */}
          {!isLogin && (
            <div className="nutrisync-role-picker">
              <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 8, display: "block" }}>
                I am a...
              </label>
              <div style={{ display: "flex", gap: 10 }}>
                {Object.entries(roleInfo).map(([key, info]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setRole(key)}
                    className={`nutrisync-role-card ${role === key ? "nutrisync-role-card--active" : ""}`}
                  >
                    <span style={{ fontSize: 24 }}>{info.icon}</span>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{info.label}</span>
                    <span style={{ fontSize: 11, opacity: 0.7 }}>{info.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div style={{
              background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
              color: "#fca5a5", borderRadius: 10, padding: "10px 14px", fontSize: 13,
              marginTop: 4,
            }}>
              {error}
            </div>
          )}

          <button className="nutrisync-login-btn" type="submit" disabled={loading}>
            {loading ? (
              <span className="nutrisync-btn-spinner" />
            ) : isLogin ? (
              "Sign In →"
            ) : (
              "Create Account →"
            )}
          </button>
        </form>

        <div className="nutrisync-login-divider"><span>or</span></div>

        <button
          className="nutrisync-login-toggle"
          onClick={() => { setIsLogin(!isLogin); setError(""); }}
          type="button"
        >
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
        </button>

        <p className="nutrisync-login-footer">Built with 💜 for a healthier you</p>
      </div>
    </div>
  );
}
