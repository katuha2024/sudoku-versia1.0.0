import { getSudoku } from "sudoku-gen";

export const generateNewGame = (difficulty = "easy") => {
  const sudoku = getSudoku(difficulty);
  
  // Функція для перетворення рядка "1-3...8-" у масив 9x9
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
    puzzle: parseGrid(sudoku.puzzle),    // Поле з пустотами
    solution: parseGrid(sudoku.solution), // Готовий розв'язок
    difficulty: sudoku.difficulty
  };
};