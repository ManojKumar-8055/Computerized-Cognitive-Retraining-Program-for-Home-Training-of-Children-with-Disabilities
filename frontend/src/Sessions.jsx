// frontend/src/Sessions.jsx
import { useEffect, useState } from "react";
import { listSessions } from "./api";

export default function Sessions({ token }) {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    if (!token) return;
    listSessions(token)
      .then(res => setSessions(res.data))
      .catch(err => console.log(err));
  }, [token]);

  if (!sessions.length) return <p style={{ textAlign: "center", marginTop: "20px" }}>No sessions yet.</p>;

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Past Game Sessions</h2>
      <table style={{ margin: "0 auto", borderCollapse: "collapse", width: "80%", maxWidth: "600px" }}>
        <thead>
          <tr style={{ backgroundColor: "#4a90e2", color: "#fff" }}>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Game Type</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Score</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Duration (s)</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Date</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s, idx) => (
            <tr key={s.id} style={{ backgroundColor: idx % 2 === 0 ? "#f9f9f9" : "#fff" }}>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>{s.game_type}</td>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>{s.score}</td>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>{s.duration}</td>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>{new Date(s.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
