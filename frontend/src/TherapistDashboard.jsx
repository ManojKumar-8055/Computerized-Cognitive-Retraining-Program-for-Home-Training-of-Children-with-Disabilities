import { useEffect, useState } from "react";
import { listUsers, analyzeUser, listSessions } from "./api";
import { formatTimestampToLocal } from "./services/date";

export default function TherapistDashboard({ token, logout }) {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [allSessions, setAllSessions] = useState([]);

  // Load users and all sessions
  useEffect(() => {
    if (!token) return;

    listUsers(token)
      .then(res => setUsers(res.data))
      .catch(console.error);

    listSessions(token)
      .then(res => {
        // Ensure proper types
        const data = res.data.map(s => ({
          ...s,
          game_type: String(s.game_type),
          score: Number(s.score),
          mistakes: Number(s.mistakes),
          duration: Number(s.duration)
        }));
        setAllSessions(data);
      })
      .catch(console.error);
  }, [token]);

  const viewAnalysis = (username) => {
    if (!username) return;
    analyzeUser(token, username)
      .then(res => setAnalysis(res.data))
      .catch(err => setAnalysis({ error: err.response?.data?.msg || "Error" }));
  };

  return (
    <div className="container" style={{ textAlign: "center" }}>
      <h2>Therapist Dashboard</h2>
      <p>Monitor players and analyze patterns</p>

      <div style={{ marginBottom: 12 }}>
        <select value={selected} onChange={e => setSelected(e.target.value)} style={{ padding: 8 }}>
          <option value="">Select a user</option>
          {users.map(u => (
            <option key={u.id} value={u.username}>{u.username}</option>
          ))}
        </select>
        <button onClick={() => viewAnalysis(selected)} style={{ marginLeft: 8 }}>View Analysis</button>
      </div>

      {analysis && !analysis.error && (
        <div style={{ textAlign: "left", margin: "0 auto", maxWidth: 600 }}>
          <h3>Analysis for {analysis.username}</h3>
          <p>Sessions: {analysis.count}</p>
          <p>Average mistakes: {analysis.average_mistakes.toFixed(2)}</p>
          <p>Last mistake count: {analysis.last_mistake}</p>
          <p>Trend: {analysis.trend}</p>
        </div>
      )}
      {analysis?.error && <p style={{ color: "red" }}>{analysis.error}</p>}

      <h3 style={{ marginTop: 20 }}>Recent Sessions (all users)</h3>
      <div style={{ maxHeight: 300, overflow: "auto", margin: "0 auto", width: "90%" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ backgroundColor: "#4a90e2", color: "#fff" }}>
            <tr>
              <th style={{ padding: 8 }}>User</th>
              <th style={{ padding: 8 }}>Game</th>
              <th style={{ padding: 8 }}>Score</th>
              <th style={{ padding: 8 }}>Mistakes</th>
              <th style={{ padding: 8 }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {allSessions.map(s => (
              <tr key={s.id} style={{ backgroundColor: "#fff" }}>
                <td style={{ padding: 6 }}>{s.user}</td>
                <td style={{ padding: 6 }}>{s.game_type}</td>
                <td style={{ padding: 6 }}>{s.score}</td>
                <td style={{ padding: 6 }}>{s.mistakes}</td>
                <td style={{ padding: 6 }}>{formatTimestampToLocal(s.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        style={{ marginTop: 20, backgroundColor: "#e24a4a", color: "#fff", padding: "8px 16px" }}
        onClick={logout}
      >
        Logout
      </button>
    </div>
  );
}
