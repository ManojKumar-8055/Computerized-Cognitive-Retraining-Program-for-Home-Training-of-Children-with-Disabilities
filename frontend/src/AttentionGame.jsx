import { useState, useEffect } from "react";
import { createSession } from "./api";

export default function AttentionGame({ token, difficulty = "easy", onFinish }) {
  const [gridSize, setGridSize] = useState(2);
  const [oddIndex, setOddIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [roundStartTime, setRoundStartTime] = useState(Date.now());
  const [roundTimes, setRoundTimes] = useState([]);
  const [gameFinished, setGameFinished] = useState(false);

  // Color schemes per difficulty
  const colorSchemes = {
    easy: { base: "rgba(250, 167, 100, 1)", odd: "rgba(255, 224, 120, 1)" },
    medium: { base: "rgba(250, 167, 100, 0.8)", odd: "rgba(250, 167, 100, 1)" },
    hard: { base: "rgba(250, 167, 100, 0.9)", odd: "rgba(250, 167, 100, 1)" },
  };

  useEffect(() => {
    setGridSize(difficulty === "easy" ? 2 : difficulty === "medium" ? 3 : 4);
    setRoundStartTime(Date.now());
    setScore(0);
    setMistakes(0);
    setRoundTimes([]);
    setGameFinished(false);
    nextRound();
  }, [difficulty]);

  const nextRound = () => {
    setOddIndex(Math.floor(Math.random() * gridSize * gridSize));
    setRoundStartTime(Date.now());
  };

  const handleClick = (idx) => {
    if (gameFinished) return;

    const roundTime = (Date.now() - roundStartTime) / 1000; // seconds
    if (idx === oddIndex) {
      setScore((s) => s + 1);
      setRoundTimes((prev) => [...prev, roundTime]);
      nextRound();
    } else {
      setMistakes((m) => m + 1);
    }
  };

  const finishGame = () => {
    setGameFinished(true);

    const totalTime = roundTimes.reduce((a, b) => a + b, 0);

    if (token) {
      createSession(token, "attention", score, Math.round(totalTime), mistakes)
        .then(() => console.log("Attention session saved"))
        .catch(console.log);
    }
  };

  const totalTime = roundTimes.reduce((a, b) => a + b, 0);
  const avgTime = roundTimes.length ? (totalTime / roundTimes.length).toFixed(2) : 0;

  const colors = colorSchemes[difficulty];

  return (
    <div className="app-card">
      <h2>Find the Odd Color - {difficulty}</h2>
      <p style={{ marginBottom: "1rem", fontStyle: "italic", color: "#475569" }}>
        Click the cell with a slightly different color
      </p>

      {!gameFinished ? (
        <div
          className="game-grid"
          style={{ gridTemplateColumns: `repeat(${gridSize}, 60px)` }}
        >
          {Array.from({ length: gridSize * gridSize }).map((_, idx) => (
            <div
              key={idx}
              onClick={() => handleClick(idx)}
              className="attention-cell"
              style={{ backgroundColor: idx === oddIndex ? colors.odd : colors.base }}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            marginTop: "1.5rem",
            background: "#f1f5f9",
            padding: "1rem 1.5rem",
            borderRadius: "12px",
            textAlign: "left",
            color: "#1e293b",
          }}
        >
          <h3 style={{ marginBottom: "0.5rem" }}>Game Results</h3>
          <p>Total Correct Selections: <strong>{score}</strong></p>
          <p>Total Mistakes: <strong>{mistakes}</strong></p>
          <p>Total Time: <strong>{totalTime.toFixed(2)} s</strong></p>
          <p>Average Time per Correct Selection: <strong>{avgTime} s</strong></p>
        </div>
      )}

      <button
        onClick={finishGame}
        style={{ marginTop: "1.5rem" }}
        disabled={gameFinished}
      >
        Finish
      </button>
      {gameFinished && (
        <button
          onClick={onFinish}
          style={{ marginTop: "1rem", background: "#3b82f6" }}
        >
          Back to Menu
        </button>
      )}
    </div>
  );
}
