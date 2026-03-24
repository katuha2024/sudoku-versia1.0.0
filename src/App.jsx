import React, { useState, useEffect, useCallback } from "react";
import { generateNewGame } from "./logica/sudokuLogic";
import "./index.css";

function App() {
  const [game, setGame] = useState(null);
  const [userGrid, setUserGrid] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);

  const startNewGame = useCallback((difficulty = "easy") => {
    const newGame = generateNewGame(difficulty);
    setGame(newGame);
    setUserGrid(Array(9).fill().map(() => Array(9).fill(null)));
    setSelectedCell(null);
  }, []);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  const updateCellValue = useCallback((value) => {
    if (!selectedCell || !game) return;
    const { row, col } = selectedCell;
    if (game.puzzle[row][col] !== null) return;

    const newGrid = userGrid.map((r, rowIndex) => 
      rowIndex === row ? r.map((c, colIndex) => colIndex === col ? value : c) : r
    );
    setUserGrid(newGrid);

    // Перевірка на перемогу
    const isComplete = newGrid.every((r, rIdx) => 
      r.every((c, cIdx) => (game.puzzle[rIdx][cIdx] || c) === game.solution[rIdx][cIdx])
    );
    if (isComplete) alert("Вітаємо! Ви розв'язали Судоку! 🎉");
  }, [selectedCell, userGrid, game]);

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
      
      <div className="sudoku-grid" role="grid" aria-label="Sudoku board 9 by 9">
        {game.puzzle.map((row, rowIndex) => (
          row.map((cell, colIndex) => {
            const isInitial = cell !== null;
            const userValue = userGrid[rowIndex][colIndex];
            const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
            
            // Логіка помилки: якщо введено число, але воно не збігається з розв'язком
            const isError = userValue !== null && userValue !== game.solution[rowIndex][colIndex];
            
            const cellValue = isInitial ? cell : (userValue || "Empty");
            const label = `Cell ${rowIndex + 1} ${colIndex + 1}, value ${cellValue}${isInitial ? ', fixed' : ''}${isError ? ', error' : ''}`;

            return (
              <div 
                key={`${rowIndex}-${colIndex}`} 
                className={`cell 
                  ${isInitial ? 'initial' : 'user-input'} 
                  ${isSelected ? 'active' : ''} 
                  ${isError ? 'error' : ''}`}
                onClick={() => setSelectedCell({ row: rowIndex, col: colIndex })}
                role="gridcell"
                aria-label={label}
                aria-selected={isSelected}
                tabIndex="0"
              >
                {isInitial ? cell : (userValue || "")}
              </div>
            );
          })
        ))}
      </div>

      <div className="number-pad" role="group" aria-label="Number input controls">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button key={num} className="pad-btn" onClick={() => updateCellValue(num)}>{num}</button>
        ))}
        <button className="pad-btn erase-btn" onClick={() => updateCellValue(null)}>✕</button>
      </div>

      <button className="new-game-btn" onClick={() => startNewGame()}>New Game</button>
    </div>
  );
}

export default App;