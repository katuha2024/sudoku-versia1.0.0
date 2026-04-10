import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import Grid from "./components/Grid/Grid";
import NumberPad from "./components/NumberPad/NumberPad";
import DifficultyMenu from "./components/DifficultyMenu/DifficultyMenu";
import Timer from "./components/Timer/Timer";
import StatsModal from "./components/StatsModal/StatsModal"; 
import DailyChallenge from "./components/DailyChallenge/DailyChallenge"; 
import { useSudokuGame } from "./hooks/useSudokuGame";
import "./index.css";

function App() {
  const [isSplashing, setIsSplashing] = useState(true);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isDailyActive, setIsDailyActive] = useState(false);
  const [showDifficultyMenu, setShowDifficultyMenu] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false); 
  const [selectedDailyDate, setSelectedDailyDate] = useState(null);

  const {
    game, userGrid, selectedCell, setSelectedCell, conflicts, seconds,
    updateCellValue, handleHint, startNewGame, completedNumbers, isWon, hintsLeft
  } = useSudokuGame();

  useEffect(() => {
    const timer = setTimeout(() => setIsSplashing(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // ОНОВЛЕНИЙ ЕФЕКТ ПЕРЕМОГИ: ЗВИЧАЙНІ + ЩОДЕННІ ІГРИ
  useEffect(() => {
    if (isWon && isGameStarted) {
      // 1. Конфеті
      const end = Date.now() + 4 * 1000;
      const colors = ["#00f2ff", "#7000ff", "#ff00e0"];
      const frame = () => {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: colors });
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: colors });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();

      // 2. Підготовка даних статистики
      const stats = JSON.parse(localStorage.getItem("sudoku_stats") || 
        '{"wins":0, "dailyWins":0, "bestTimes":{"EASY":null,"MEDIUM":null,"HARD":null}}');

      // 3. Перевірка режиму гри (Щоденна чи Звичайна)
      if (selectedDailyDate) {
        // Якщо вибрана дата — це щоденний челендж
        stats.dailyWins = (stats.dailyWins || 0) + 1;
        
        // Позначаємо в календарі як виконане
        const savedDays = JSON.parse(localStorage.getItem("sudoku_completed_days") || "[]");
        if (!savedDays.includes(selectedDailyDate)) {
          savedDays.push(selectedDailyDate);
          localStorage.setItem("sudoku_completed_days", JSON.stringify(savedDays));
        }
      } else {
        // Якщо це звичайна гра
        stats.wins += 1;
        
        // Оновлюємо найкращий час (тільки для звичайних ігор)
        const currentDiff = game.difficulty;
        const currentTime = seconds;
        if (!stats.bestTimes[currentDiff] || currentTime < stats.bestTimes[currentDiff]) {
          stats.bestTimes[currentDiff] = currentTime;
        }
      }

      // 4. Збереження результатів
      localStorage.setItem("sudoku_stats", JSON.stringify(stats));
    }
  }, [isWon, isGameStarted, selectedDailyDate, game.difficulty, seconds]);

  if (!game) return <div className="loading">Генерація...</div>;

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

  return (
    <div className="game-container fade-in-content">
      {!isGameStarted && !isDailyActive ? (
        <div className="main-menu">
          <div className="hero-section">
            <h1 className="main-title">sudoku<span className="dot">.</span>neon</h1>
            <p className="hero-subtitle">Solve puzzles. Master your mind.</p>
          </div>
          <div className="menu-options">
            <button className="menu-btn play-btn" onClick={() => {
              setSelectedDailyDate(null);
              setIsGameStarted(true);
            }}>PLAY NOW</button>
            <button className="menu-btn" onClick={() => setIsDailyActive(true)}>DAILY CHALLENGE</button>
            <button className="menu-btn" onClick={() => setShowDifficultyMenu(true)}>
              LEVEL: <span className="current-level">{game.difficulty}</span>
            </button>
            <button className="menu-btn" onClick={() => setIsStatsOpen(true)}>STATISTICS</button>
          </div>
          {showDifficultyMenu && (
            <div className="difficulty-overlay">
               <DifficultyMenu 
                onSelect={(level) => { startNewGame(level); setShowDifficultyMenu(false); }} 
                onCancel={() => setShowDifficultyMenu(false)} 
              />
            </div>
          )}
        </div>
      ) : isDailyActive ? (
        <div className="daily-screen">
          <div className="game-header">
            <button className="game-btn" onClick={() => setIsDailyActive(false)}>← MENU</button>
          </div>
          <DailyChallenge onDateSelect={(date) => {
            const offset = date.getTimezoneOffset() * 60000;
            const localDate = new Date(date.getTime() - offset).toISOString().split('T')[0];
            setSelectedDailyDate(localDate);
            setIsDailyActive(false);
            setIsGameStarted(true);
          }} />
        </div>
      ) : (
        <div className="game-screen">
          <div className="game-header">
             <button className="game-btn" onClick={() => { setIsGameStarted(false); setSelectedDailyDate(null); }}>← MENU</button>
             <Timer seconds={seconds} />
             <div className="stats-icon" onClick={() => setIsStatsOpen(true)}>🏆</div>
          </div>
          <Grid puzzle={game.puzzle} userGrid={userGrid} selectedCell={selectedCell} conflicts={conflicts} onCellClick={setSelectedCell} />
          <NumberPad completedNumbers={completedNumbers} onNumberClick={updateCellValue} onHintClick={handleHint} hintsLeft={hintsLeft} />
          <div className="game-footer">
            <button className="game-btn" onClick={() => startNewGame(game.difficulty)}>Restart</button>
          </div>
        </div>
      )}

      <StatsModal isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} />

      {isWon && isGameStarted && (
        <div className="win-overlay">
          <div className="win-modal">
            <h2 className="neon-text-win">🎉 VICTORY! 🎉</h2>
            <button className="new-game-btn" onClick={() => {
              startNewGame(game.difficulty);
              setIsGameStarted(false);
              setSelectedDailyDate(null);
            }}>Main Menu</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;