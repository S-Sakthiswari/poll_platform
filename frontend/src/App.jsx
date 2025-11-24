import React, { useState, useEffect } from "react";
import { api, setAuthToken, getAuthToken, clearAuth } from "./api";
import AuthCard from "./components/AuthCard";
import PollList from "./components/PollList";
import CreatePollForm from "./components/CreatePollForm";

const App = () => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("poll_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("polls"); // "polls" | "create"

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      fetchPolls();
    }
  }, []);

  const handleAuthSuccess = (user, token) => {
    setUser(user);
    setAuthToken(token);
    localStorage.setItem("poll_user", JSON.stringify(user));
    fetchPolls();
  };

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const res = await api.get("/polls");
      setPolls(res.data);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    setPolls([]);
  };

  const handleVote = async (pollId, optionId) => {
    try {
      await api.post(`/polls/${pollId}/vote`, { optionId });
      fetchPolls();
    } catch (err) {
      alert(err.response?.data?.message || "Error submitting vote");
    }
  };

  const handlePollCreated = () => {
    setView("polls");
    fetchPolls();
  };

  return (
    <div className="app-root">
      <div className="background-gradient" />
      <header className="app-header glass">
        <div className="logo">
          <span className="logo-dot" />
          <span>QuickVote</span>
        </div>
        {user && (
          <nav className="nav-tabs">
            <button
              className={view === "polls" ? "nav-tab active" : "nav-tab"}
              onClick={() => setView("polls")}
            >
              Polls
            </button>
            <button
              className={view === "create" ? "nav-tab active" : "nav-tab"}
              onClick={() => setView("create")}
            >
              Create Poll
            </button>
          </nav>
        )}
        <div className="header-right">
          {user ? (
            <>
              <span className="user-name">Hi, {user.name || user.email}</span>
              <button className="outline-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : null}
        </div>
      </header>

      <main className="app-main">
        {!user ? (
          <AuthCard onAuthSuccess={handleAuthSuccess} />
        ) : (
          <div className="content-layout">
            {view === "polls" && (
              <div className="glass panel">
                <div className="panel-header">
                  <h2>Live Polls</h2>
                  <p className="muted">
                    Vote once per poll. See results update in real-time.
                  </p>
                </div>
                {loading ? (
                  <div className="center-text">Loading polls...</div>
                ) : polls.length === 0 ? (
                  <div className="center-text muted">
                    No polls yet. Create the first one!
                  </div>
                ) : (
                  <PollList polls={polls} onVote={handleVote} />
                )}
              </div>
            )}
            {view === "create" && (
              <div className="glass panel">
                <div className="panel-header">
                  <h2>Create a Poll</h2>
                  <p className="muted">
                    Add a question, at least two options, and an optional expiry time.
                  </p>
                </div>
                <CreatePollForm onCreated={handlePollCreated} />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
