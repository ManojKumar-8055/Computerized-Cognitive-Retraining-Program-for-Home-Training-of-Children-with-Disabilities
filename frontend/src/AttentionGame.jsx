import { useState, useEffect } from "react";
import { createSession } from "./api";

export default function AttentionGame({ token, onFinish }) {
  const [gridSize, setGridSize] = useState(2);
  const [oddIndex, setOddIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());

  const nextRound = () => {
    const total = gridSize * gridSize;
    setOddIndex(Math.floor(Math.random() * total));
  };

  useEffect(() => {
    nextRound();
  }, [gridSize]);

  const handleClick = (idx) => {
    if (idx === oddIndex) {
      setScore(s => s + 1);
      if (gridSize < 6) setGridSize(g => g + 1); // increase difficulty
      nextRound();
    }
  };

  const finishGame = () => {
    const duration = Math.round((Date.now() - startTime) / 1000);
    if (token) {
      createSession(token, "attention", score, duration)
        .then(() => console.log("Attention session saved"))
        .catch(err => console.log(err));
    }
    if (onFinish) onFinish(); // back to menu
  };

  return (
    <div className="container">
      <h2>Find the Odd Color</h2>
      <p>Score: {score}</p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${gridSize}, 60px)`,
          gap: "5px",
          marginTop: "1rem",
          justifyContent: "center"
        }}
      >
        {Array.from({ length: gridSize * gridSize }).map((_, idx) => {
          const base = "rgb(100, 150, 250)";
          const odd = "rgb(120, 170, 255)";
          return (
            <div
              key={idx}
              onClick={() => handleClick(idx)}
              style={{
                width: "60px",
                height: "60px",
                backgroundColor: idx === oddIndex ? odd : base,
                cursor: "pointer",
                borderRadius: "8px",
              }}
            />
          );
        })}
      </div>
      <button style={{ marginTop: "1rem" }} onClick={finishGame}>Back to Menu</button>
    </div>
  );
}
