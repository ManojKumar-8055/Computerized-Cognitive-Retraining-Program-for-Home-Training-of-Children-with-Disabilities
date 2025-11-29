import { useState } from "react"; 
import { register, login } from "./api";

export default function Auth({ setToken, setRole, onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login"); // login or register
  const [roleSel, setRoleSel] = useState("parent");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res =
        mode === "login"
          ? await login(username, password)
          : await register(username, password, roleSel);

      if (!res.data.access_token) throw new Error("Login failed: No token returned");

      setToken(res.data.access_token);
      setRole(res.data.role || roleSel);

      if (mode === "login" && onLogin) onLogin();
    } catch (err) {
      setError(err.response?.data?.msg || err.message || "An unexpected error occurred");
    }
  };

  return (
    <div className="app-card">
      <h2>{mode === "login" ? "Login to Home-Cogniplay" : "Register Account"}</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "320px", margin: "0 auto" }}>
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />

        {mode === "register" && (
          <select value={roleSel} onChange={e => setRoleSel(e.target.value)}>
            <option value="parent">Parent / Student</option>
            <option value="therapist">Therapist</option>
          </select>
        )}

        <button type="submit">{mode === "login" ? "Login" : "Register"}</button>
      </form>

      <button 
        onClick={() => setMode(mode === "login" ? "register" : "login")} 
        style={{ marginTop: "1rem", background: "transparent", color: "#3b82f6" }}
      >
        {mode === "login" ? "Create an account" : "Back to login"}
      </button>
    </div>
  );
}
