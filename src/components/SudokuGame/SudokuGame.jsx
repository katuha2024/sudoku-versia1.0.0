import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { onAuthStateChanged } from "firebase/auth";
import Grid from "../../components/Grid/Grid";
import NumberPad from "../../components/NumberPad/NumberPad";
import DifficultyMenu from "../../components/DifficultyMenu/DifficultyMenu";
import Timer from "../../components/Timer/Timer";
import StatsModal from "../../components/StatsModal/StatsModal"; 
import DailyChallenge from "../../components/DailyChallenge/DailyChallenge"; 
import { useSudokuGame } from "../../hooks/useSudokuGame";
import { db, auth } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

import "./../../index.css";

const defaultGameState = {
  isGameStarted: false,
  isDailyActive: false,
  isStatsOpen: false,
  showDifficultyMenu: false,
};

// Підтримуємо обидві схеми пропсів для сумісності з AppNew
function SudokuGame({
  user: initialUser,
  gameState,
  setGameState,
  externalState,
  setExternalState,
}) {
  const [user, setUser] = useState(initialUser);
  const [isSplashing, setIsSplashing] = useState(true);
  
  // Витягуємо значення з глобального стану App.js
  const resolvedGameState = gameState ?? externalState ?? defaultGameState;
  const updateGameState = setGameState ?? setExternalState ?? (() => {});
  const { isGameStarted, isDailyActive, isStatsOpen, showDifficultyMenu } = resolvedGameState;

  const {
    game, userGrid, selectedCell, setSelectedCell, conflicts, seconds,
    updateCellValue, handleHint, startNewGame, completedNumbers, isWon, hintsLeft
  } = useSudokuGame();

  const gameRef = React.useRef(game);
  const secondsRef = React.useRef(seconds);

  useEffect(() => { gameRef.current = game; }, [game]);
  useEffect(() => { secondsRef.current = seconds; }, [seconds]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsSplashing(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isWon && isGameStarted) {
      const saveToFirebase = async () => {
        try {
          await addDoc(collection(db, "results"), {
            playerName: user ? user.email : "Guest", 
            difficulty: gameRef.current.difficulty,
            timeInSeconds: secondsRef.current,
            date: serverTimestamp()
          });
        } catch (e) { console.error(e); }
      };
      saveToFirebase();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  }, [isWon, isGameStarted, user]);

  if (!game) return <div className="loading">Генерація...</div>;
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
             <button className="big-neon-btn" onClick={() => updateGameState(prev => ({...prev, isGameStarted: true}))}>
               START PLAYING
             </button>
          </div>
        ) : isDailyActive ? (
          <DailyChallenge onDateSelect={() => updateGameState(prev => ({...prev, isDailyActive: false, isGameStarted: true}))} />
        ) : (
          <div className="sudoku-play-zone">
            <div className="game-status-bar">
               <Timer seconds={seconds} />
               <div className="difficulty-tag">{game.difficulty}</div>
            </div>
            <Grid puzzle={game.puzzle} userGrid={userGrid} selectedCell={selectedCell} conflicts={conflicts} onCellClick={setSelectedCell} />
            <NumberPad completedNumbers={completedNumbers} onNumberClick={updateCellValue} onHintClick={handleHint} hintsLeft={hintsLeft} />
          </div>
        )}
      </main>

      {/* Керуємо модалками через сеттер з App.js */}
      <StatsModal isOpen={isStatsOpen} onClose={() => updateGameState(prev => ({...prev, isStatsOpen: false}))} />
      
      {showDifficultyMenu && (
        <div className="difficulty-overlay">
           <DifficultyMenu 
            onSelect={(level) => { startNewGame(level); updateGameState(prev => ({...prev, showDifficultyMenu: false, isGameStarted: true})); }} 
            onCancel={() => updateGameState(prev => ({...prev, showDifficultyMenu: false}))} 
          />
        </div>
      )}
    </div>
  );
}

export default SudokuGame;