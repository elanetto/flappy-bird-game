import { useState } from "react";
import GameCanvas from "./components/GameCanvas";
import ScoreBoard from "./components/ScoreBoard";

function App() {
  const [score, setScore] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-sky-300">
      <h1 className="text-4xl font-bold mb-4">Flappy Bird 🐤</h1>
      <ScoreBoard score={score} />
      <GameCanvas setScore={setScore} />
    </div>
  );
}

export default App;
