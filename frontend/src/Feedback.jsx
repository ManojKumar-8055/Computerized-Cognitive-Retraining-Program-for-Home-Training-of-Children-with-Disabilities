// Feedback.jsx
import { useState, useEffect } from "react";

const STORAGE_KEY = "home_cogniplay_feedback";

export default function Feedback({ visible = false, onClose }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [thanks, setThanks] = useState("");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch (e) {
      console.error("Load feedback failed", e);
    }
  }, []);

  useEffect(() => {
    if (visible) document.body.classList.add("modal-open");
    else document.body.classList.remove("modal-open");

    return () => document.body.classList.remove("modal-open");
  }, [visible]);

  function saveFeedback() {
    if (!comment.trim()) {
      setThanks("Please add a short comment.");
      return;
    }

    const entry = {
      id: Date.now(),
      rating,
      comment: comment.trim(),
      date: new Date().toISOString(),
    };

    const newHistory = [entry, ...history].slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    setHistory(newHistory);

    setThanks("Thanks — your feedback was saved.");
    setComment("");
    setRating(5);
  }

  function clearHistory() {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  }

  function mailToAdmin() {
    const subject = encodeURIComponent("Home-Cogniplay Feedback");
    const body = encodeURIComponent(`Rating: ${rating}\n\nComment:\n${comment}`);

    window.location.href = `mailto:manojkurubhas0622@gmail.com?subject=${subject}&body=${body}`;
  }

  if (!visible) return null;

  return (
    <div className="feedback-overlay">
      <div className="app-card feedback-card-centered">

        <h2 style={{ marginBottom: "10px" }}>Send Feedback</h2>
        <p style={{ color: "#475569", marginBottom: "15px" }}>
          Tell us how we can improve Home-Cogniplay.
        </p>

        {/* Rating */}
        <label style={{ display: "block", textAlign: "left", marginBottom: 6 }}>Rating</label>
        <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
          <option value={5}>5 — Excellent</option>
          <option value={4}>4 — Good</option>
          <option value={3}>3 — Okay</option>
          <option value={2}>2 — Needs Work</option>
          <option value={1}>1 — Poor</option>
        </select>

        {/* Comment */}
        <label style={{ display: "block", textAlign: "left", marginBottom: 6, marginTop: 15 }}>
          Comment
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Share your thoughts..."
        />

        {/* Buttons */}
        <div style={{ display: "flex", gap: "10px", marginTop: "15px", flexWrap: "wrap" }}>
          <button onClick={saveFeedback}>Save (Local)</button>
          <button onClick={mailToAdmin} style={{ background: "#0ea5a4" }}>
            Send to Email
          </button>
          <button onClick={clearHistory} style={{ background: "#ef4444" }}>
            Clear Saved
          </button>
        </div>

        {thanks && (
          <div className="success-message" style={{ marginTop: 12 }}>
            {thanks}
          </div>
        )}

        {/* Saved Feedback */}
        {history.length > 0 && (
          <>
            <h4 style={{ marginTop: 20 }}>Saved Feedback</h4>
            <div style={{ maxHeight: 160, overflowY: "auto", textAlign: "left", marginTop: 8 }}>
              {history.map((h) => (
                <div
                  key={h.id}
                  style={{ padding: 8, borderBottom: "1px solid #e2e8f0" }}
                >
                  <div style={{ fontSize: 12, color: "#64748b" }}>
                    {new Date(h.date).toLocaleString()} — Rating: {h.rating}
                  </div>
                  <div style={{ marginTop: 6 }}>{h.comment}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Close button at bottom */}
        <button
          onClick={onClose}
          style={{
            marginTop: "25px",
            width: "160px",
            background: "#475569",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
