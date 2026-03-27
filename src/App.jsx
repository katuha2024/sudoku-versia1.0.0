import React, { useState, useEffect, useCallback, useMemo } from "react";
import { generateNewGame } from "./logica/sudokuLogic";
import { Lightbulb } from "lucide-react"; // Імпортуємо іконку лампочки
import "./index.css";

function App() {
  const [game, setGame] = useState(null);
  const [userGrid, setUserGrid] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const startNewGame = useCallback((difficulty = "easy") => {
    const newGame = generateNewGame(difficulty);
    setGame(newGame);
    setUserGrid(Array(9).fill().map(() => Array(9).fill(null)));
    setSelectedCell(null);
    setConflicts([]);
    setSeconds(0);
    setIsActive(true);
  }, []);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const completedNumbers = useMemo(() => {
    if (!game) return {};
    const counts = {};
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const val = game.puzzle[r][c] !== null ? game.puzzle[r][c] : userGrid[r][c];
        if (val) counts[val] = (counts[val] || 0) + 1;
      }
    }
    return counts;
  }, [game, userGrid]);

  const checkAllConflicts = (grid, puzzle) => {
    const newConflicts = [];
    const getVal = (r, c) => puzzle[r][c] !== null ? puzzle[r][c] : grid[r][c];

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const val = getVal(r, c);
        if (val === null) continue;
        let hasConflict = false;

        for (let i = 0; i < 9; i++) {
          if (i !== c && getVal(r, i) === val) hasConflict = true;
          if (i !== r && getVal(i, c) === val) hasConflict = true;
        }

        const startR = Math.floor(r / 3) * 3;
        const startC = Math.floor(c / 3) * 3;
        for (let i = startR; i < startR + 3; i++) {
          for (let j = startC; j < startC + 3; j++) {
            if ((i !== r || j !== c) && getVal(i, j) === val) hasConflict = true;
          }
        }
        if (hasConflict) newConflicts.push(`${r}-${c}`);
      }
    }
    setConflicts(newConflicts);
  };

  const handleHint = () => {
    if (!selectedCell || !game) return;
    const { row, col } = selectedCell;

    if (game.puzzle[row][col] !== null || userGrid[row][col] === game.solution[row][col]) return;

    const correctValue = game.solution[row][col];
    
    const newGrid = userGrid.map((r, rIdx) =>
      rIdx === row ? r.map((c, cIdx) => (cIdx === col ? correctValue : c)) : r
    );
    
    setUserGrid(newGrid);
    checkAllConflicts(newGrid, game.puzzle);
    setSeconds((prev) => prev + 15); 
  };

  const updateCellValue = useCallback((value) => {
    if (!selectedCell || !game) return;
    const { row, col } = selectedCell;
    if (game.puzzle[row][col] !== null) return;

    const currentValue = userGrid[row][col];
    const newValue = currentValue === value ? null : value;

    if (newValue !== null && completedNumbers[newValue] >= 9) return;

    const newGrid = userGrid.map((r, rowIndex) => 
      rowIndex === row ? r.map((c, colIndex) => colIndex === col ? newValue : c) : r
    );
    setUserGrid(newGrid);
    checkAllConflicts(newGrid, game.puzzle);

    const isComplete = newGrid.every((r, rIdx) => 
      r.every((c, cIdx) => (game.puzzle[rIdx][cIdx] || (c !== null ? c : 0)) === game.solution[rIdx][cIdx])
    );
    
    if (isComplete) {
      setIsActive(false);
      alert(`Вітаємо! Ви розв'язали Судоку за ${formatTime(seconds)}! 🎉`);
    }
  }, [selectedCell, userGrid, game, completedNumbers, seconds]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= "1" && e.key <= "9") updateCellValue(parseInt(e.key));
      else if (e.key === "Backspace" || e.key === "Delete") updateCellValue(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [updateCellValue]);

  if (!game) return <div className="loading">Генерація...</div>;

  const activeCellValue = selectedCell ? (game.puzzle[selectedCell.row][selectedCell.col] || userGrid[selectedCell.row][selectedCell.col]) : null;

  return (
    <div className="game-container">
      <h1 className="neon-title">SUDOKU NEON</h1>
      
      <div className="timer">{formatTime(seconds)}</div>
      
      <div className="sudoku-grid">
        {game.puzzle.map((row, rowIndex) => (
          row.map((cell, colIndex) => {
            const isInitial = cell !== null;
            const userValue = userGrid[rowIndex][colIndex];
            const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
            const isError = conflicts.includes(`${rowIndex}-${colIndex}`);
            const cellValue = isInitial ? cell : (userValue || "");

            return (
              <div 
                key={`${rowIndex}-${colIndex}`} 
                className={`cell ${isInitial ? 'initial' : 'user-input'} ${isSelected ? 'active' : ''} ${isError ? 'error' : ''}`}
                onClick={() => setSelectedCell({ row: rowIndex, col: colIndex })}
              >
                {cellValue}
              </div>
            );
          })
        ))}
      </div>

      <div className="number-pad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
          const isDone = completedNumbers[num] >= 9;
          const isCurrentActive = activeCellValue === num;
          
          return (
            <button 
              key={num} 
              className={`pad-btn ${isDone ? 'hidden' : ''} ${isCurrentActive ? 'active-num' : ''}`} 
              onClick={() => !isDone && updateCellValue(num)}
              disabled={isDone}
            >
              {num}
            </button>
          );
        })}
        {/* Кнопка-лампочка замість текстової HINT */}
        <button 
          className="pad-btn hint-icon-btn" 
          onClick={handleHint}
          title="Підказка (+15 сек)"
        >
          <Lightbulb size={24} />
        </button>
      </div>

      <button className="new-game-btn" onClick={() => startNewGame()}>New Game</button>
    </div>
  );
}

export default App;