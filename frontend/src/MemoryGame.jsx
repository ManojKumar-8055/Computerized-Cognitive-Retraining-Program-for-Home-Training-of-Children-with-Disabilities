import { useState, useEffect } from "react";
import { createSession } from "./api";

const fruits = ["🍎","🍌","🍇","🍓","🍒","🥝"];
const shuffleArray = arr => [...arr].sort(() => Math.random() - 0.5);

export default function MemoryGame({ token, difficulty = "easy", onFinish }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [roundTimes, setRoundTimes] = useState([]);
  const [gameFinished, setGameFinished] = useState(false);
  const [lastFlipTime, setLastFlipTime] = useState(Date.now());

  useEffect(() => {
    let selectedFruits = fruits.slice(
      0,
      difficulty === "easy" ? 3 : difficulty === "medium" ? 4 : 6
    );
    setCards(shuffleArray([...selectedFruits, ...selectedFruits]));
    setStartTime(Date.now());
    setLastFlipTime(Date.now());
    setFlipped([]);
    setMatched([]);
    setMistakes(0);
    setRoundTimes([]);
    setGameFinished(false);
  }, [difficulty]);

  const handleClick = (idx) => {
    if (flipped.includes(idx) || matched.includes(idx) || gameFinished) return;

    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      const flipDuration = (Date.now() - lastFlipTime) / 1000; // seconds
      setLastFlipTime(Date.now());

      if (cards[first] === cards[second]) {
        const newMatched = [...matched, first, second];
        setMatched(newMatched);
        setRoundTimes((prev) => [...prev, flipDuration]);

        if (newMatched.length === cards.length) saveSession(newMatched.length / 2);
      } else {
        setMistakes((m) => m + 1);
      }

      setTimeout(() => setFlipped([]), 800);
    }
  };

  const saveSession = (score) => {
    const duration = Math.round((Date.now() - startTime) / 1000);
    setGameFinished(true);

    if (token) {
      createSession(token, "memory", score, duration, mistakes)
        .then(() => console.log("Memory session saved"))
        .catch(console.log);
    }
  };

  const totalTime = roundTimes.reduce((a, b) => a + b, 0);
  const avgTime = roundTimes.length ? (totalTime / roundTimes.length).toFixed(2) : 0;

  return (
    <div className="app-card">
      <h2>Memory Game - {difficulty}</h2>
      <p style={{ marginBottom: "1rem", fontStyle: "italic", color: "#475569" }}>
        Match the same fruits as quickly as possible
      </p>

      <div className="game-grid" style={{ gridTemplateColumns: "repeat(4, 80px)" }}>
        {cards.map((c, idx) => (
          <div
            key={idx}
            onClick={() => handleClick(idx)}
            className={`memory-card ${flipped.includes(idx) || matched.includes(idx) ? "flipped" : ""}`}
          >
            {flipped.includes(idx) || matched.includes(idx) ? c : ""}
          </div>
        ))}
      </div>

      {gameFinished && (
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
          <p>Total Pairs Matched: <strong>{matched.length / 2}</strong></p>
          <p>Total Mistakes: <strong>{mistakes}</strong></p>
          <p>Total Time: <strong>{totalTime.toFixed(2)} s</strong></p>
          <p>Average Time per Match: <strong>{avgTime} s</strong></p>
        </div>
      )}

      <button
        onClick={gameFinished ? onFinish : () => saveSession(matched.length / 2)}
        style={{ marginTop: "1.5rem" }}
      >
        {gameFinished ? "Back to Menu" : "Finish"}
      </button>
    </div>
  );
}
