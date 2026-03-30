import React from "react";
import Cell from "../Cell/Cell"; 
import styles from "./Grid.module.css"; 

const Grid = ({ puzzle, userGrid, selectedCell, conflicts, onCellClick }) => {
  return (
    <div className={styles.sudokuGrid}>
      {puzzle.map((row, rowIndex) => (
        row.map((cell, colIndex) => {
          // Чи є цифра частиною початкової умови (неможливо змінити)
          const isInitial = cell !== null;
          
          // Порівнюємо об'єкт selectedCell із поточними координатами
          const isSelected = 
            selectedCell?.row === rowIndex && 
            selectedCell?.col === colIndex;
          
          // Перевіряємо, чи є дана клітинка у списку конфліктів
          const isError = conflicts.includes(`${rowIndex}-${colIndex}`);

          return (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              // Пріоритет: початкове число -> введене користувачем -> пустий рядок
              value={isInitial ? cell : (userGrid[rowIndex][colIndex] || "")}
              isInitial={isInitial}
              isSelected={isSelected}
              isError={isError}
              // КЛЮЧОВА ПРАВКА: передаємо об'єкт для setSelectedCell
              onClick={() => onCellClick({ row: rowIndex, col: colIndex })}
            />
          );
        })
      ))}
    </div>
  );
};

export default Grid;