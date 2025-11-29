import { useState } from "react";
import MemoryGame from "./MemoryGame";
import AttentionGame from "./AttentionGame";
import Auth from "./Auth";
import Sessions from "./Sessions";
import Feedback from "./Feedback";

export default function App() {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [screen, setScreen] = useState("auth"); 
  const [nextGame, setNextGame] = useState(null);
  const [difficulty, setDifficulty] = useState("easy");
  const [showFeedback, setShowFeedback] = useState(false);

  // ------------------- AUTH SCREEN -------------------
  if (screen === "auth") {
    return (
      <>
        <Auth
          setToken={setToken}
          setRole={setRole}
          onLogin={() => setScreen("menu")}
        />
        {showFeedback && (
          <Feedback
            visible={showFeedback}
            onClose={() => setShowFeedback(false)}
          />
        )}
      </>
    );
  }

  // ------------------- THERAPIST DASHBOARD -------------------
  if (role === "therapist") {
    return (
      <div className="app-card">
        <h1>Therapist Dashboard</h1>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "15px",
            flexWrap: "wrap",
          }}
        >
          <button onClick={() => setScreen("sessions")}>View All Sessions</button>
          <button
            onClick={() => {
              setToken(null);
              setRole(null);
              setScreen("auth");
            }}
          >
            Logout
          </button>
          <button onClick={() => setShowFeedback(true)}>Give Feedback</button>
        </div>

        {screen === "sessions" && <Sessions token={token} />}

        {showFeedback && (
          <Feedback
            visible={showFeedback}
            onClose={() => setShowFeedback(false)}
          />
        )}
      </div>
    );
  }

  // ------------------- PARENT/STUDENT DASHBOARD -------------------
  if (role === "parent") {
    // ----- DIFFICULTY SELECTION SCREEN -----
    if (screen === "difficulty") {
      return (
        <div className="app-card">
          <h2>
            Select Difficulty for{" "}
            {nextGame
              ? nextGame.charAt(0).toUpperCase() + nextGame.slice(1)
              : ""}
          </h2>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              alignItems: "center",
              marginTop: "25px",
            }}
          >
            <button
              style={{ width: "180px" }}
              onClick={() => {
                setDifficulty("easy");
                setScreen(nextGame);
              }}
            >
              Easy
            </button>
            <button
              style={{ width: "180px" }}
              onClick={() => {
                setDifficulty("medium");
                setScreen(nextGame);
              }}
            >
              Medium
            </button>
            <button
              style={{ width: "180px" }}
              onClick={() => {
                setDifficulty("hard");
                setScreen(nextGame);
              }}
            >
              Hard
            </button>
          </div>

          <button
            onClick={() => setScreen("menu")}
            style={{ marginTop: "20px", width: "180px", background: "#ef4444" }}
          >
            Back to Menu
          </button>

          {showFeedback && (
            <Feedback
              visible={showFeedback}
              onClose={() => setShowFeedback(false)}
            />
          )}
        </div>
      );
    }

    // ----- MEMORY GAME -----
    if (screen === "memory") {
      return (
        <>
          <MemoryGame
            token={token}
            difficulty={difficulty}
            onFinish={() => setScreen("menu")}
          />
          {showFeedback && (
            <Feedback
              visible={showFeedback}
              onClose={() => setShowFeedback(false)}
            />
          )}
        </>
      );
    }

    // ----- ATTENTION GAME -----
    if (screen === "attention") {
      return (
        <>
          <AttentionGame
            token={token}
            difficulty={difficulty}
            onFinish={() => setScreen("menu")}
          />
          {showFeedback && (
            <Feedback
              visible={showFeedback}
              onClose={() => setShowFeedback(false)}
            />
          )}
        </>
      );
    }

    // ----- GAMES MENU -----
    return (
      <div className="app-card">
        <h1>Home-Cogniplay</h1>
        <h3>Select a Cognitive Game</h3>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            alignItems: "center",
            marginTop: "30px",
          }}
        >
          <button
            style={{ width: "220px" }}
            onClick={() => {
              setNextGame("memory");
              setScreen("difficulty");
            }}
          >
            Play Memory
          </button>

          <button
            style={{ width: "220px" }}
            onClick={() => {
              setNextGame("attention");
              setScreen("difficulty");
            }}
          >
            Play Attention
          </button>

          <button
            style={{ width: "220px", background: "#ef4444" }}
            onClick={() => {
              setToken(null);
              setRole(null);
              setScreen("auth");
            }}
          >
            Logout
          </button>

          <button
            style={{ width: "220px" }}
            onClick={() => setShowFeedback(true)}
          >
            Give Feedback
          </button>
        </div>

        {showFeedback && (
          <Feedback
            visible={showFeedback}
            onClose={() => setShowFeedback(false)}
          />
        )}
      </div>
    );
  }

  return null;
}
