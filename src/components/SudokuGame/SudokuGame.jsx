import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import Grid from "../../components/Grid/Grid";
import NumberPad from "../../components/NumberPad/NumberPad";
import DifficultyMenu from "../../components/DifficultyMenu/DifficultyMenu";
import Timer from "../../components/Timer/Timer";
import StatsModal from "../../components/StatsModal/StatsModal"; 
import DailyChallenge from "../../components/DailyChallenge/DailyChallenge"; 
import { useSudokuGame } from "../../hooks/useSudokuGame";
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, getDoc, setDoc } from "firebase/firestore";

import "./../../index.css";

const defaultGameState = {
  isGameStarted: false,
  isDailyActive: false,
  isStatsOpen: false,
  showDifficultyMenu: false,
};

function SudokuGame({
  user: initialUser,
  gameState,
  setGameState,
  externalState,
  setExternalState,
}) {
  const [isSplashing, setIsSplashing] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem("sudoku-theme") || "default");
  const hasSavedResult = useRef(false);

  const resolvedGameState = gameState ?? externalState ?? defaultGameState;
  const updateGameState = setGameState ?? setExternalState ?? (() => {});
  const { isGameStarted, isDailyActive, isStatsOpen } = resolvedGameState;

  const {
    game, userGrid, setUserGrid, selectedCell, setSelectedCell, conflicts, seconds,
    updateCellValue, handleHint, startNewGame, completedNumbers, isWon, hintsLeft,
    isLost, mistakes, maxMistakes
  } = useSudokuGame();

  const gameRef = useRef(game);
  const secondsRef = useRef(seconds);

  useEffect(() => { gameRef.current = game; }, [game]);
  useEffect(() => { secondsRef.current = seconds; }, [seconds]);

  useEffect(() => {
    document.body.classList.remove("theme-default", "theme-cyber", "theme-gold");
    document.body.classList.add(`theme-${theme}`);
    localStorage.setItem("sudoku-theme", theme);
  }, [theme]);

  useEffect(() => {
    const timer = setTimeout(() => setIsSplashing(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isGameStarted) hasSavedResult.current = false;
  }, [isGameStarted]);

  // --- Логіка Auto-fill ---
  const emptyCellsCount = userGrid.flat().filter(cell => cell === 0).length;
  const canAutoFill = emptyCellsCount > 0 && emptyCellsCount <= 5;

  const handleAutoFill = () => {
    if (!game?.solution) return;
    
    const newGrid = userGrid.map((row, rIdx) =>
      row.map((cell, cIdx) => (cell === 0 ? game.solution[rIdx][cIdx] : cell))
    );
    
    setUserGrid(newGrid);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.8 } });
  };

  const claimDailyBonus = async () => {
    if (!initialUser) return alert("Please sign in to claim bonus!");
    const userRef = doc(db, "users", initialUser.uid);
    try {
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, { coins: 50, lastBonusDate: serverTimestamp() });
        return alert("First bonus claimed! +50 coins 🪙");
      }
      const lastBonus = userSnap.data()?.lastBonusDate?.toDate();
      const today = new Date();
      if (lastBonus && lastBonus.toDateString() === today.toDateString()) {
        alert("Come back tomorrow for more coins!");
        return;
      }
      await updateDoc(userRef, { coins: increment(50), lastBonusDate: serverTimestamp() });
      alert("Daily bonus claimed! +50 coins 🪙");
    } catch (e) { console.error("Bonus error:", e); }
  };

  const calculateReward = (difficulty) => {
    const d = difficulty?.toLowerCase();
    if (d === "hard") return 50;
    if (d === "medium") return 20;
    return 10;
  };

  useEffect(() => {
    if (isWon && isGameStarted && !hasSavedResult.current) {
      hasSavedResult.current = true; 
      const reward = calculateReward(gameRef.current?.difficulty);
      const syncVictoryData = async () => {
        try {
          await addDoc(collection(db, "results"), {
            playerName: initialUser?.email || "Guest", 
            difficulty: gameRef.current?.difficulty || "easy",
            timeInSeconds: secondsRef.current,
            rewardCoins: reward,
            date: serverTimestamp()
          });
          if (initialUser?.uid) {
            const userRef = doc(db, "users", initialUser.uid);
            await updateDoc(userRef, { coins: increment(reward) });
          }
        } catch (e) { console.error("Firebase sync error:", e); }
      };
      syncVictoryData();
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
  }, [isWon, isGameStarted, initialUser]);

  const goToMainMenu = () => {
    updateGameState(prev => ({...prev, isGameStarted: false, isDailyActive: false}));
    startNewGame("easy"); 
  };

  if (!game) return <div className="loading">Generating grid...</div>;
  if (isSplashing) return (
    <div className="splash-screen"><h1 className="splash-logo">sudoku<span>.</span>neon</h1></div>
  );

  return (
    <div className="game-container fade-in-content">
      <main className="game-main-area">
        {!isGameStarted && !isDailyActive ? (
          <div className="welcome-section">
             <div className="hero-text">
               <h2>Ready to challenge your brain?</h2>
               <p>Master the neon grid and become a Sudoku pro.</p>
             </div>
             <div className="menu-actions">
                <button className="big-neon-btn" onClick={() => updateGameState(prev => ({...prev, isGameStarted: true}))}>
                  START PLAYING
                </button>
                <button className="bonus-btn" onClick={claimDailyBonus}>
                  🎁 Daily Bonus
                </button>
             </div>
             <div className="theme-selector">
                <p>Select Theme:</p>
                <button className={`t-btn ${theme === 'default' ? 'active' : ''}`} onClick={() => setTheme("default")}>Neon</button>
                <button className={`t-btn ${theme === 'cyber' ? 'active' : ''}`} onClick={() => setTheme("cyber")}>Cyber</button>
                <button className={`t-btn ${theme === 'gold' ? 'active' : ''}`} onClick={() => setTheme("gold")}>Gold</button>
             </div>
          </div>
        ) : isDailyActive ? (
          <DailyChallenge onDateSelect={() => updateGameState(prev => ({...prev, isDailyActive: false, isGameStarted: true}))} />
        ) : (
          <div className="sudoku-play-zone">
            <div className="game-status-bar">
               <Timer seconds={seconds} />
               <div className="mistakes-tag">Mistakes: {mistakes}/{maxMistakes}</div>
               <div className="difficulty-tag">{game.difficulty}</div>
            </div>
            <Grid 
              puzzle={game.puzzle} 
              userGrid={userGrid} 
              selectedCell={selectedCell} 
              conflicts={conflicts} 
              onCellClick={setSelectedCell} 
            />
            
            {/* Панель керування: або NumberPad, або AutoFill */}
            <div className="controls-wrapper">
              {canAutoFill && !isWon && !isLost ? (
                <div className="auto-fill-container">
                  <button className="auto-fill-btn" onClick={handleAutoFill}>
                    ✨ AUTO-FILL ({emptyCellsCount})
                  </button>
                </div>
              ) : (
                <NumberPad
                  completedNumbers={completedNumbers}
                  onNumberClick={updateCellValue}
                  onHintClick={handleHint}
                  hintsLeft={hintsLeft}
                  disabled={isWon || isLost}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {(isWon || isLost) && (
        <div className="result-overlay">
          <div className="result-card">
            <h3 className={isWon ? "text-win" : "text-lose"}>{isWon ? "YOU WON!" : "GAME OVER"}</h3>
            {isWon && (
              <div className="coin-reward">
                <div className="neon-coin-icon"></div>
                <div className="coin-amount">+{calculateReward(game.difficulty)}</div>
              </div>
            )}
            <p>{isWon ? "Great job!" : `Too many mistakes (${maxMistakes})`}</p>
            <div className="result-actions">
              <button className="new-game-btn" onClick={goToMainMenu}>MAIN MENU</button>
              <button className="big-neon-btn" onClick={() => startNewGame(game.difficulty)}>PLAY AGAIN</button>
            </div>
          </div>
        </div>
      )}
      <StatsModal isOpen={isStatsOpen} onClose={() => updateGameState(prev => ({...prev, isStatsOpen: false}))} />
    </div>
  );
}

export default SudokuGame;