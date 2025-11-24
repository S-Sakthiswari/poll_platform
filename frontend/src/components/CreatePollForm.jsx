import React, { useState } from "react";
import { api } from "../api";

const CreatePollForm = ({ onCreated }) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [expiresInMinutes, setExpiresInMinutes] = useState("");
  const [error, setError] = useState("");

  const handleOptionChange = (index, value) => {
    setOptions((opts) => {
      const copy = [...opts];
      copy[index] = value;
      return copy;
    });
  };

  const addOption = () => {
    setOptions((opts) => [...opts, ""]);
  };

  const removeOption = (index) => {
    setOptions((opts) => opts.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedOptions = options.map((o) => o.trim()).filter(Boolean);
    if (!question.trim()) {
      setError("Question is required");
      return;
    }
    if (trimmedOptions.length < 2) {
      setError("Add at least two options");
      return;
    }

    let expiresAt = null;
    if (expiresInMinutes) {
      const mins = parseInt(expiresInMinutes, 10);
      if (!isNaN(mins) && mins > 0) {
        const dt = new Date(Date.now() + mins * 60 * 1000);
        expiresAt = dt.toISOString();
      }
    }

    try {
      await api.post("/polls", {
        question: question.trim(),
        options: trimmedOptions,
        expiresAt
      });
      setQuestion("");
      setOptions(["", ""]);
      setExpiresInMinutes("");
      onCreated?.();
    } catch (err) {
      setError(err.response?.data?.message || "Error creating poll");
    }
  };

  return (
    <form className="create-form" onSubmit={handleSubmit}>
      <div>
        <div className="field-label">Question</div>
        <textarea
          className="textarea"
          placeholder="e.g. Which feature should we ship next?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
      </div>
      <div>
        <div className="field-label">Options</div>
        {options.map((opt, i) => (
          <div className="option-row-inputs" key={i}>
            <input
              className="input"
              type="text"
              value={opt}
              onChange={(e) => handleOptionChange(i, e.target.value)}
              placeholder={`Option ${i + 1}`}
            />
            {options.length > 2 && (
              <button
                type="button"
                className="small-btn"
                onClick={() => removeOption(i)}
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button type="button" className="small-btn" onClick={addOption}>
          + Add option
        </button>
      </div>
      <div>
        <div className="field-label">Expires in (minutes, optional)</div>
        <input
          className="input"
          type="number"
          min="1"
          placeholder="e.g. 30"
          value={expiresInMinutes}
          onChange={(e) => setExpiresInMinutes(e.target.value)}
        />
        <p className="inline-help">
          Leave blank if you don't want the poll to expire.
        </p>
      </div>
      {error && <div className="error-text">{error}</div>}
      <button className="primary-btn" type="submit">
        Publish poll
      </button>
    </form>
  );
};

export default CreatePollForm;
