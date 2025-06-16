import { useState } from "react";
import GameCanvas from "./components/GameCanvas";
import ScoreBoard from "./components/ScoreBoard";

function App() {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(
    () => parseInt(localStorage.getItem("highScore")) || 0
  );

  return (
    <div className="flex flex-col items-center pt-6 bg-blue-200 h-screen">
      <h1 className="text-4xl font-bold mb-2">Flappy Bird</h1>
      <ScoreBoard score={score} highScore={highScore} />
      <GameCanvas setScore={setScore} setHighScore={setHighScore} />
    </div>
  );
}

export default App;
