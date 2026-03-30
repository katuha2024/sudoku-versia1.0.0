import { getSudoku } from "sudoku-gen";

// 1. Функція генерації нової гри (твоя існуюча)
export const generateNewGame = (difficulty = "easy") => {
  const sudoku = getSudoku(difficulty);
  
  const parseGrid = (str) => {
    const grid = [];
    for (let i = 0; i < 9; i++) {
      grid.push(
        str.slice(i * 9, i * 9 + 9).split("").map(char => 
          char === "-" ? null : parseInt(char)
        )
      );
    }
    return grid;
  };

  return {
    puzzle: parseGrid(sudoku.puzzle),
    solution: parseGrid(sudoku.solution),
    difficulty: sudoku.difficulty
  };
};

// 2. НОВА ФУНКЦІЯ: Пошук конфліктів (помилок)
export const getConflicts = (initialPuzzle, userGrid) => {
  const conflicts = new Set();

  // Створюємо актуальну сітку: початкові цифри + введені користувачем
  const fullGrid = initialPuzzle.map((row, rIdx) =>
    row.map((cell, cIdx) => (cell !== null ? cell : userGrid[rIdx][cIdx]))
  );

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const value = fullGrid[r][c];
      if (!value) continue; // Пропускаємо порожні клітинки

      // Перевірка рядка
      for (let i = 0; i < 9; i++) {
        if (i !== c && fullGrid[r][i] === value) {
          conflicts.add(`${r}-${c}`);
          conflicts.add(`${r}-${i}`);
        }
      }

      // Перевірка стовпця
      for (let i = 0; i < 9; i++) {
        if (i !== r && fullGrid[i][c] === value) {
          conflicts.add(`${r}-${c}`);
          conflicts.add(`${i}-${c}`);
        }
      }

      // Перевірка квадрата 3x3
      const startRow = Math.floor(r / 3) * 3;
      const startCol = Math.floor(c / 3) * 3;
      for (let i = startRow; i < startRow + 3; i++) {
        for (let j = startCol; j < startCol + 3; j++) {
          if ((i !== r || j !== c) && fullGrid[i][j] === value) {
            conflicts.add(`${r}-${c}`);
            conflicts.add(`${i}-${j}`);
          }
        }
      }
    }
  }

  // Повертаємо масив координат помилок ['0-1', '0-5', ...]
  return Array.from(conflicts);
};