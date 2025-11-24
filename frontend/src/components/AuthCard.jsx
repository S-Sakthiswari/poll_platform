import React, { useState } from "react";
import { api } from "../api";

const AuthCard = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (mode === "signup") {
        const res = await api.post("/auth/signup", {
          name: form.name,
          email: form.email,
          password: form.password
        });
        onAuthSuccess(res.data.user, res.data.token);
      } else {
        const res = await api.post("/auth/login", {
          email: form.email,
          password: form.password
        });
        onAuthSuccess(res.data.user, res.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="auth-wrapper">
      <section className="hero-copy">
        <h1 className="hero-title">
          Run quick polls with{" "}
          <span className="hero-highlight">notion-style clarity</span>.
        </h1>
        <p className="hero-subtitle">
          Create stunning, minimal polls in seconds. Share with your team,
          class, or audience and watch results update in real-time.
        </p>
        <div className="hero-pills">
          <span className="pill">One vote per user</span>
          <span className="pill">Real-time results</span>
          <span className="pill">No setup hassle</span>
        </div>
      </section>
      <section className="auth-card">
        <div className="auth-tabs">
          <button
            className={mode === "login" ? "auth-tab active" : "auth-tab"}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            className={mode === "signup" ? "auth-tab active" : "auth-tab"}
            onClick={() => setMode("signup")}
          >
            Sign up
          </button>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div>
              <div className="field-label">Name</div>
              <input
                className="input"
                type="text"
                name="name"
                placeholder="Your name"
                value={form.name}
                onChange={handleChange}
              />
            </div>
          )}
          <div>
            <div className="field-label">Email</div>
            <input
              className="input"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <div className="field-label">Password</div>
            <input
              className="input"
              type="password"
              name="password"
              placeholder="Minimum 6 characters"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          {error && <div className="error-text">{error}</div>}
          <button className="primary-btn" type="submit">
            {mode === "signup" ? "Create account" : "Continue"}
          </button>
        </form>
      </section>
    </div>
  );
};

export default AuthCard;
