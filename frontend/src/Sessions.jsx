import { useEffect, useState } from "react";
import axios from "axios";
import { formatTimestampToLocal } from "./services/date";


export default function Sessions({ token }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    axios.get("http://127.0.0.1:5000/api/sessions", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        setSessions(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.msg || "Error fetching sessions");
        setLoading(false);
      });
  }, [token]);

  if (loading) return <p>Loading sessions...</p>;
  if (error) return <div className="error-message">{error}</div>;
  if (!sessions.length) return <p>No sessions recorded yet.</p>;

  return (
    <div className="app-card">
      <h2>All Game Sessions</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Game Type</th>
            <th>Score</th>
            <th>Mistakes</th>
            <th>Duration (s)</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map(s => (
            <tr key={s.id}>
              <td>{s.user}</td>
              <td>{s.game_type}</td>
              <td>{s.score}</td>
              <td>{s.mistakes}</td>
              <td>{s.duration}</td>
              <td>{formatTimestampToLocal(s.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
