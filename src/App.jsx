import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import Grid from "./components/Grid/Grid";
import NumberPad from "./components/NumberPad/NumberPad";
import DifficultyMenu from "./components/DifficultyMenu/DifficultyMenu";
import Timer from "./components/Timer/Timer";
import StatsModal from "./components/StatsModal/StatsModal"; 
import { useSudokuGame } from "./hooks/useSudokuGame";
import "./index.css";

function App() {
  const [isSplashing, setIsSplashing] = useState(true); // Новий стан для заставки
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [showDifficultyMenu, setShowDifficultyMenu] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false); 
  
  const {
    game, userGrid, selectedCell, setSelectedCell, conflicts, seconds,
    updateCellValue, handleHint, startNewGame, completedNumbers, isWon, hintsLeft
  } = useSudokuGame();

  // Логіка Splash Screen (заставка на 3 секунди)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashing(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Ефект конфеті при переможі
  useEffect(() => {
    if (isWon) {
      const end = Date.now() + 4 * 1000; 
      const colors = ["#00f2ff", "#7000ff", "#ff00e0"]; 

      (function frame() {
        confetti({
          particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: colors,
        });
        confetti({
          particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: colors,
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      }());
    }
  }, [isWon]);

  if (!game) return <div className="loading">Генерація...</div>;

  // 1. ВИВІД SPLASH SCREEN
  if (isSplashing) {
    return (
      <div className="splash-screen">
        <div className="splash-grid">
          {[...Array(9)].map((_, i) => (
            <div key={i} className={`splash-cube cube-${i}`}></div>
          ))}
        </div>
        <h1 className="splash-logo">sudoku<span className="dot">.</span>neon</h1>
      </div>
    );
  }

  // 2. ОСНОВНИЙ КОНТЕНТ
  return (
    <div className="game-container fade-in-content">
      {!isGameStarted ? (
        /* --- ГОЛОВНА СТОРІНКА --- */
        <div className="main-menu">
          <div className="menu-illustration">
            <div className="mini-grid">
              {[...Array(9)].map((_, i) => (
                <div key={i} className={`mini-cell cell-${i}`}></div>
              ))}
            </div>
          </div>
          
          <div className="hero-section">
            <h1 className="main-title">
              sudoku<span className="dot">.</span>neon
            </h1>
            <p className="hero-subtitle">Solve puzzles. Master your mind.</p>
          </div>

          <div className="menu-options">
            <button className="menu-btn play-btn" onClick={() => setIsGameStarted(true)}>
              PLAY NOW
            </button>

            <button className="menu-btn" onClick={() => setShowDifficultyMenu(true)}>
              LEVEL: <span className="current-level">{game.difficulty}</span>
            </button>

            <button className="menu-btn" onClick={() => setIsStatsOpen(true)}>
              STATISTICS
            </button>
          </div>
          
          {showDifficultyMenu && (
            <div className="difficulty-overlay">
               <DifficultyMenu 
                onSelect={(level) => {
                  startNewGame(level);
                  setShowDifficultyMenu(false);
                }} 
                onCancel={() => setShowDifficultyMenu(false)} 
              />
            </div>
          )}
        </div>
      ) : (
        /* --- ІГРОВИЙ ЕКРАН --- */
        <div className="game-screen">
          <div className="game-header">
             <button className="back-btn" onClick={() => setIsGameStarted(false)}>
               ← MENU
             </button>
             <Timer seconds={seconds} />
             <div className="stats-icon" onClick={() => setIsStatsOpen(true)}>🏆</div>
          </div>

          <Grid 
            puzzle={game.puzzle}
            userGrid={userGrid}
            selectedCell={selectedCell}
            conflicts={conflicts}
            onCellClick={setSelectedCell}
          />

          <NumberPad 
            completedNumbers={completedNumbers}
            onNumberClick={updateCellValue}
            onHintClick={handleHint}
            hintsLeft={hintsLeft} 
          />

          <div className="game-footer">
            <button className="restart-btn" onClick={() => startNewGame(game.difficulty)}>
              Restart
            </button>
          </div>
        </div>
      )}

      <StatsModal isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} />

      {isWon && (
        <div className="win-overlay">
          <div className="win-modal">
            <h2 className="neon-text-win">🎉 VICTORY! 🎉</h2>
            <p>Time: {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}</p>
            <button className="new-game-btn" onClick={() => {
              startNewGame(game.difficulty);
              setIsGameStarted(false);
            }}>
              Main Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;