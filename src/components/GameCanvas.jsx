import { useEffect, useRef, useCallback, useState } from "react";

const GRAVITY = 0.25;
const FLAP_STRENGTH = -6;
const PIPE_WIDTH = 60;
const PIPE_GAP = 180;
const PIPE_SPEED = 1.5;

function GameCanvas({ setScore }) {
  const canvasRef = useRef(null);
  const player = useRef({ x: 100, y: 200, width: 40, height: 40, velocity: 0 });

  const pipes = useRef([]);
  const score = useRef(0);
  const images = useRef({
    bird: new Image(),
    bg: new Image(),
    pipe: new Image(),
  });

  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const animationId = useRef(null);

  const loadAssets = () => {
    let loadedCount = 0;
    const totalAssets = 3;

    // Goal: Make own drawings
    images.current.bird.src = "/bird.png";
    images.current.bg.src = "/bg.png";
    images.current.pipe.src = "/pipe.png";

    Object.values(images.current).forEach((img) => {
      img.onload = () => {
        loadedCount++;
        if (loadedCount === totalAssets) {
          setAssetsLoaded(true);
        }
      };
    });
  };

  const createPipe = useCallback(() => {
    const topHeight = Math.random() * 200 + 20;
    return {
      x: 600,
      topHeight,
      bottomY: topHeight + PIPE_GAP,
      width: PIPE_WIDTH,
      passed: false,
    };
  }, []);

  const resetGame = useCallback(() => {
    player.current.y = 200;
    player.current.velocity = -2; // little flap
    pipes.current = [createPipe()];
    score.current = 0;
    setScore(0);
    setFinalScore(0);
    setGameOver(false);

    // Short grace before game starts
    setIsRunning(false);
    setTimeout(() => {
      setIsRunning(true);
    }, 300);
  }, [createPipe, setScore]);

  const checkCollision = (pipe) => {
    const p = player.current;

    const collidePipe =
      p.x < pipe.x + pipe.width &&
      p.x + p.width > pipe.x &&
      (p.y < pipe.topHeight || p.y + p.height > pipe.bottomY);

    const outOfBounds = p.y < 0 || p.y + p.height > 500;

    return collidePipe || outOfBounds;
  };

  const flap = useCallback(() => {
    if (isRunning) {
      player.current.velocity = FLAP_STRENGTH;
    }
  }, [isRunning]);

  useEffect(() => {
    loadAssets();
  }, []);

  useEffect(() => {
    if (!assetsLoaded) return;

    const canvas = canvasRef.current;
    const c = canvas.getContext("2d");

    const handleKey = (e) => {
      if (e.key === " ") {
        e.preventDefault();
        flap();
      }
    };

    const handleTouch = (e) => {
      e.preventDefault();
      flap();
    };

    canvas.addEventListener("click", flap);
    canvas.addEventListener("touchstart", handleTouch);
    window.addEventListener("keydown", handleKey);

    const loop = () => {
      if (isRunning) {
        player.current.velocity += GRAVITY;
        player.current.y += player.current.velocity;

        pipes.current.forEach((pipe) => {
          pipe.x -= PIPE_SPEED;

          if (!pipe.passed && pipe.x + pipe.width < player.current.x) {
            pipe.passed = true;
            score.current += 1;
            setScore(score.current);
          }

          if (checkCollision(pipe) && !gameOver) {
            setFinalScore(score.current);
            setGameOver(true);
            setIsRunning(false);
          }
        });

        if (pipes.current[pipes.current.length - 1].x < 300) {
          pipes.current.push(createPipe());
        }

        pipes.current = pipes.current.filter((p) => p.x + p.width > 0);
      }

      // Draw background
      c.drawImage(images.current.bg, 0, 0, canvas.width, canvas.height);

      // Pipes
      pipes.current.forEach((pipe) => {
        // Top pipe (rotated)
        c.save();
        c.translate(pipe.x + pipe.width / 2, pipe.topHeight / 2);
        c.rotate(Math.PI);
        c.drawImage(
          images.current.pipe,
          -pipe.width / 2,
          -pipe.topHeight / 2,
          pipe.width,
          pipe.topHeight
        );
        c.restore();

        // Bottom pipe
        c.drawImage(
          images.current.pipe,
          pipe.x,
          pipe.bottomY,
          pipe.width,
          canvas.height - pipe.bottomY
        );
      });

      // Bird
      c.drawImage(
        images.current.bird,
        player.current.x,
        player.current.y,
        player.current.width,
        player.current.height
      );

      animationId.current = requestAnimationFrame(loop);
    };

    animationId.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationId.current);
      window.removeEventListener("keydown", handleKey);
      canvas.removeEventListener("click", flap);
      canvas.removeEventListener("touchstart", handleTouch);
    };
  }, [
    assetsLoaded,
    isRunning,
    resetGame,
    createPipe,
    setScore,
    gameOver,
    flap,
  ]);

  return (
    <div className="flex flex-col sm:items-center items-start w-full overflow-x-hidden">
      {!isRunning && !gameOver && (
        <button
          onClick={resetGame}
          className="mb-4 ml-4 sm:ml-0 px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded shadow"
        >
          Start Game 🐤
        </button>
      )}

      {/* Responsive scaling wrapper anchored left on mobile */}
      <div className="relative w-[600px] h-[500px] max-w-full scale-100 sm:scale-100 xs:scale-[0.8] xxs:scale-[0.6] origin-top-left ml-0 sm:ml-auto">
        {/* Game border/shadow wrapper */}
        <div className="absolute top-0 left-0 w-full h-full rounded-lg border-4 border-black shadow-lg overflow-hidden">
          {/* Canvas */}
          <canvas
            ref={canvasRef}
            width={600}
            height={500}
            className="absolute top-0 left-0"
          />

          {/* Game Over Overlay */}
          {gameOver && (
            <div className="absolute top-0 left-0 w-full h-full bg-black/70 text-white flex flex-col justify-center items-center space-y-4">
              <h2 className="text-4xl font-bold">Bruh, you died</h2>
              <p className="text-2xl">Score: {finalScore}</p>
              <button
                onClick={resetGame}
                className="mt-2 px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded shadow"
              >
                Restart
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GameCanvas;
