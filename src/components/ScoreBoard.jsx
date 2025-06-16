function ScoreBoard({ score, highScore }) {
  return (
    <div className="mb-2 w-[550px] flex justify-between">
      <span className="">High score: {highScore}</span>
      <span className="">Score: {score}</span>
    </div>
  );
}

export default ScoreBoard;
