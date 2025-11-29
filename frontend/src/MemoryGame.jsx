import { useState, useEffect } from "react";
import { createSession } from "./api";

const fruits = ["🍎","🍌","🍇","🍓","🍒","🥝"];
const shuffleArray = arr => [...arr].sort(() => Math.random() - 0.5);

export default function MemoryGame({ token, onFinish }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);

  useEffect(() => {
    setCards(shuffleArray([...fruits, ...fruits]));
  }, []);

  const handleClick = idx => {
    if (flipped.includes(idx) || matched.includes(idx)) return;
    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (cards[first] === cards[second]) {
        const newMatched = [...matched, first, second];
        setMatched(newMatched);

        if (token) {
          createSession(token, "memory", newMatched.length / 2, 30)
            .then(res => console.log("Saved session", res.data))
            .catch(err => console.log(err));
        }

        // Game completed
        if (newMatched.length === cards.length) {
          setTimeout(() => {
            alert("Game Completed!");
            if (onFinish) onFinish();
          }, 300);
        }
      }
      setTimeout(() => setFlipped([]), 800);
    }
  };

  return (
    <div className="container">
      <h2>Memory Game</h2>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 80px)", gap:"10px", justifyContent: "center" }}>
        {cards.map((c, idx) => (
          <div key={idx} onClick={() => handleClick(idx)}
            style={{
              width:"80px", height:"80px", fontSize:"2rem",
              display:"flex", justifyContent:"center", alignItems:"center",
              backgroundColor: flipped.includes(idx) || matched.includes(idx) ? "#fff" : "#888",
              cursor:"pointer", borderRadius:"8px"
            }}>
            {flipped.includes(idx) || matched.includes(idx) ? c : ""}
          </div>
        ))}
      </div>
      <p style={{ marginTop: "15px" }}>Matched: {matched.length / 2} / {fruits.length}</p>
      <button style={{ marginTop: "15px" }} onClick={onFinish}>Back to Menu</button>
    </div>
  );
}
