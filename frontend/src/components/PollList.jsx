import React from "react";

const PollList = ({ polls, onVote }) => {
  return (
    <div className="poll-list">
      {polls.map((poll) => {
        const totalVotes =
          poll.options?.reduce((sum, o) => sum + (o.votes || 0), 0) || 0;
        return (
          <article key={poll.id} className="poll-card">
            <header className="poll-header">
              <h3 className="poll-question">{poll.question}</h3>
              <div className="poll-meta">
                <span className="badge">
                  {totalVotes} vote{totalVotes === 1 ? "" : "s"}
                </span>
                {poll.is_expired && (
                  <span className="badge expired">Expired</span>
                )}
                {poll.has_voted && (
                  <span className="badge voted">You voted</span>
                )}
              </div>
            </header>
            <div className="options-grid">
              {poll.options?.map((opt) => {
                const pct =
                  totalVotes === 0
                    ? 0
                    : Math.round(((opt.votes || 0) / totalVotes) * 100);
                return (
                  <div key={opt.id} className="option-row">
                    <div className="option-label">
                      <span className="option-text">{opt.text}</span>
                      <span className="option-votes">
                        {opt.votes || 0} • {pct}%
                      </span>
                    </div>
                    <div className="option-bar">
                      <div
                        className="option-bar-fill"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <button
                      className="vote-btn"
                      disabled={poll.has_voted || poll.is_expired}
                      onClick={() => onVote(poll.id, opt.id)}
                    >
                      Vote
                    </button>
                  </div>
                );
              })}
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default PollList;
