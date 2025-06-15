import { useEffect, useRef, useCallback, useState } from "react";

const GRAVITY = 0.25;
const FLAP_STRENGTH = -6;
const PIPE_WIDTH = 60;
const PIPE_GAP = 180;
const PIPE_SPEED = 1.5;
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 500;

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
      x: CANVAS_WIDTH,
      topHeight,
      bottomY: topHeight + PIPE_GAP - 5,
      width: PIPE_WIDTH,
      passed: false,
      hitboxHeight: topHeight - 5, // for top pipe
      hitboxBottomY: topHeight + PIPE_GAP, // for bottom pipe
      hitboxThickness: 1, // visual pipes stay full, but hitbox is smaller
    };
  }, []);

  const resetGame = useCallback(() => {
    player.current.y = 200;
    player.current.velocity = -2;
    pipes.current = [createPipe()];
    score.current = 0;
    setScore(0);
    setFinalScore(0);
    setGameOver(false);
    setIsRunning(false);

    setTimeout(() => {
      setIsRunning(true);
    }, 300);
  }, [createPipe, setScore]);

  const checkCollision = (pipe) => {
    const p = player.current;

    const hitTop =
      p.x < pipe.x + pipe.width &&
      p.x + p.width > pipe.x &&
      p.y < pipe.hitboxHeight;

    const hitBottom =
      p.x < pipe.x + pipe.width &&
      p.x + p.width > pipe.x &&
      p.y + p.height > pipe.hitboxBottomY;

    const outOfBounds = p.y < 0 || p.y + p.height > CANVAS_HEIGHT;

    return hitTop || hitBottom || outOfBounds;
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

      // Draw full-size pipes
      pipes.current.forEach((pipe) => {
        const pipeImg = images.current.pipe;
        const pipeHeight = pipeImg.height;

        // ✅ Top pipe (flipped upside down, starts from pipe.topHeight)
        c.save();
        c.translate(pipe.x + pipe.width / 2, pipe.topHeight);
        c.scale(1, -1); // Flip vertically
        c.drawImage(pipeImg, -pipe.width / 2, 0, pipe.width, pipeHeight);
        c.restore();

        // ✅ Bottom pipe (normal)
        c.drawImage(pipeImg, pipe.x, pipe.bottomY, pipe.width, pipeHeight);
      });

      // Draw bird
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
    <div className="flex flex-col lg:justify-center justify-start w-full max-w-[600px] mx-auto px-4">
      {!isRunning && !gameOver && (
        <button
          onClick={resetGame}
          className="mb-4 px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded shadow"
        >
          Start Game 🐤
        </button>
      )}

      <div className="relative w-[600px] h-[500px]">
        <div className="absolute top-0 left-0 w-full h-full rounded-lg border-4 border-black shadow-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="absolute top-0 left-0"
          />

          {gameOver && (
            <div className="absolute top-0 left-0 w-full h-full bg-black/70  text-white flex flex-col justify-center items-center space-y-4">
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
