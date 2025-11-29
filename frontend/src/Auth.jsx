import { useState } from "react";
import { register, login } from "./api";

export default function Auth({ setToken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login"); // login or register
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res =
        mode === "login"
          ? await login(username, password)
          : await register(username, password);
      setToken(res.data.access_token);
    } catch (err) {
      setError(err.response?.data?.msg || "Error");
    }
  };

  return (
    <div className="container">
      <h2>{mode === "login" ? "Login" : "Register"}</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">{mode === "login" ? "Login" : "Register"}</button>
      </form>
      <button
        style={{ marginTop: "10px" }}
        onClick={() => setMode(mode === "login" ? "register" : "login")}
      >
        Switch to {mode === "login" ? "Register" : "Login"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
