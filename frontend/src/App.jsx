import { useState } from "react";
import MemoryGame from "./MemoryGame";
import AttentionGame from "./AttentionGame";
import Auth from "./Auth";
import Sessions from "./Sessions";

export default function App() {
  const [token, setToken] = useState(null);  // start without token
  const [screen, setScreen] = useState("auth"); // login/register
  const [gamescreen, setGameScreen] = useState("menu"); // menu, memory, attention, sessions

  // Show Auth page
  if (screen === "auth") {
    return (
      <Auth
        setToken={(t) => {
          setToken(t);
          localStorage.setItem("token", t);
          setScreen("menu"); // go to main menu
        }}
      />
    );
  }

  // Show selected game or sessions
  if (gamescreen === "memory") 
    return <MemoryGame token={token} onFinish={() => setGameScreen("menu")} />;
  if (gamescreen === "attention") 
    return <AttentionGame token={token} onFinish={() => setGameScreen("menu")} />;
  if (gamescreen === "sessions")
    return (
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button
          style={{ marginBottom: "15px", padding: "10px 20px" }}
          onClick={() => setGameScreen("menu")}
        >
          Back to Menu
        </button>
        <Sessions token={token} />
      </div>
    );

  // Main menu
  return (
    <div className="container" style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Cognitive Games</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px", alignItems: "center" }}>
        <button style={{ width: "200px", padding: "10px", fontSize: "16px" }} onClick={() => setGameScreen("memory")}>
          Play Memory
        </button>
        <button style={{ width: "200px", padding: "10px", fontSize: "16px" }} onClick={() => setGameScreen("attention")}>
          Play Attention
        </button>
        <button style={{ width: "200px", padding: "10px", fontSize: "16px", backgroundColor: "#4a90e2", color: "#fff" }} 
                onClick={() => setGameScreen("sessions")}>
          View Scores
        </button>
        <button
          style={{ width: "200px", padding: "10px", fontSize: "16px", backgroundColor: "#e24a4a", color: "#fff" }}
          onClick={() => {
            localStorage.removeItem("token");
            setToken(null);
            setScreen("auth"); // back to login
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
