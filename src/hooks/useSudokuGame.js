import { useState, useEffect, useCallback, useMemo } from "react";
import { generateNewGame, getConflicts } from "../logica/sudokuLogic";

export const useSudokuGame = () => {
  const maxMistakes = 3;
  const [game, setGame] = useState(() => generateNewGame("easy"));
  const [userGrid, setUserGrid] = useState(() => 
    Array(9).fill().map(() => Array(9).fill(null))
  );
  const [selectedCell, setSelectedCell] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [isWon, setIsWon] = useState(false);
  const [isLost, setIsLost] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(10);

  // --- ЛОГІКА СТАТИСТИКИ ---
  const saveStats = useCallback((time, level) => {
    // Отримуємо існуючу статистику або створюємо дефолтну
    const rawData = localStorage.getItem("sudoku_neon_stats");
    const stats = rawData ? JSON.parse(rawData) : { 
      totalWins: 0, 
      bestTime: { easy: null, medium: null, hard: null } 
    };

    // Оновлюємо дані
    stats.totalWins += 1;
    const currentBest = stats.bestTime[level];
    if (!currentBest || time < currentBest) {
      stats.bestTime[level] = time;
    }

    // Зберігаємо в браузер
    localStorage.setItem("sudoku_neon_stats", JSON.stringify(stats));
  }, []);

  const startNewGame = useCallback((level = "easy") => {
    const newGame = generateNewGame(level);
    setGame(newGame);
    setUserGrid(Array(9).fill().map(() => Array(9).fill(null)));
    setSelectedCell(null);
    setConflicts([]);
    setSeconds(0);
    setIsActive(true);
    setIsWon(false);
    setIsLost(false);
    setMistakes(0);
    setHintsLeft(10);
  }, []);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  // Перевірка перемоги з викликом статистики
  useEffect(() => {
    if (!game || isWon) return;

    const hasEmptyCells = userGrid.some((row, rIdx) => 
      row.some((cell, cIdx) => game.puzzle[rIdx][cIdx] === null && cell === null)
    );

    if (!hasEmptyCells && conflicts.length === 0) {
      const timer = setTimeout(() => {
        setIsWon(true);
        setIsActive(false);
        // ЗБЕРЕЖЕННЯ ПЕРЕМОГИ
        saveStats(seconds, game.difficulty || 'easy');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [userGrid, conflicts, game, isWon, seconds, saveStats]);

  const handleHint = useCallback(() => {
    if (!selectedCell || !game || isWon || isLost || hintsLeft <= 0) return;
    const { row, col } = selectedCell;
    if (game.puzzle[row][col] !== null) return;
    const correctValue = game.solution[row][col];

    setUserGrid((prevGrid) => {
      const newGrid = prevGrid.map((r, rIdx) => 
        rIdx === row ? r.map((c, cIdx) => (cIdx === col ? correctValue : c)) : r
      );
      setConflicts(getConflicts(game.puzzle, newGrid));
      return newGrid;
    });
    setHintsLeft((prev) => prev - 1);
  }, [selectedCell, game, isWon, isLost, hintsLeft]);

  const updateCellValue = useCallback((value) => {
    if (!selectedCell || !game || isWon || isLost) return;
    const { row, col } = selectedCell;
    if (game.puzzle[row][col] !== null) return;
    
    setUserGrid((prevGrid) => {
      const currentValue = prevGrid[row][col];
      const newValue = currentValue === value ? null : value;
      const expectedValue = game.solution[row][col];
      if (newValue !== null && newValue !== expectedValue) {
        setMistakes((prev) => {
          const next = prev + 1;
          if (next >= maxMistakes) {
            setIsLost(true);
            setIsActive(false);
          }
          return next;
        });
      }
      const newGrid = prevGrid.map((r, rIdx) => 
        rIdx === row ? r.map((c, cIdx) => (cIdx === col ? newValue : c)) : r
      );
      setConflicts(getConflicts(game.puzzle, newGrid));
      return newGrid;
    });
  }, [selectedCell, game, isWon, isLost, maxMistakes]);

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

  return {
    game, userGrid, selectedCell, setSelectedCell, conflicts, seconds,
    updateCellValue, startNewGame, completedNumbers, handleHint,
    hintsLeft, isWon, isLost, mistakes, maxMistakes
  };
};