import React, { useState, useEffect, useCallback, useMemo } from "react";
import { generateNewGame } from "./logica/sudokuLogic";
import "./index.css";

function App() {
  const [game, setGame] = useState(null);
  const [userGrid, setUserGrid] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [conflicts, setConflicts] = useState([]);

  const startNewGame = useCallback((difficulty = "easy") => {
    const newGame = generateNewGame(difficulty);
    setGame(newGame);
    setUserGrid(Array(9).fill().map(() => Array(9).fill(null)));
    setSelectedCell(null);
    setConflicts([]);
  }, []);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  // Рахуємо кількість кожної цифри на полі для панелі вводу
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

  const updateCellValue = useCallback((value) => {
    if (!selectedCell || !game) return;
    const { row, col } = selectedCell;
    if (game.puzzle[row][col] !== null) return;

    // Якщо ми намагаємося ввести цифру, яка вже завершена, ігноруємо (для клавіатури)
    if (value !== null && completedNumbers[value] >= 9) return;

    const newGrid = userGrid.map((r, rowIndex) => 
      rowIndex === row ? r.map((c, colIndex) => colIndex === col ? value : c) : r
    );
    setUserGrid(newGrid);
    checkAllConflicts(newGrid, game.puzzle);

    const isComplete = newGrid.every((r, rIdx) => 
      r.every((c, cIdx) => (game.puzzle[rIdx][cIdx] || c) === game.solution[rIdx][cIdx])
    );
    if (isComplete) alert("Вітаємо! Ви розв'язали Судоку! 🎉");
  }, [selectedCell, userGrid, game, completedNumbers]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= "1" && e.key <= "9") updateCellValue(parseInt(e.key));
      else if (e.key === "Backspace" || e.key === "Delete") updateCellValue(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [updateCellValue]);

  if (!game) return <div className="loading" role="alert">Генерація...</div>;

  return (
    <div className="game-container">
      <h1 className="neon-title">SUDOKU NEON</h1>
      
      <div className="sudoku-grid" role="grid">
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
          return (
            <button 
              key={num} 
              className={`pad-btn ${isDone ? 'hidden' : ''}`} 
              onClick={() => !isDone && updateCellValue(num)}
              disabled={isDone}
            >
              {num}
            </button>
          );
        })}
        <button className="pad-btn erase-btn" onClick={() => updateCellValue(null)}>✕</button>
      </div>

      <button className="new-game-btn" onClick={() => startNewGame()}>New Game</button>
    </div>
  );
}

export default App;