import React from "react";
import Cell from "../Cell/Cell"; 
import styles from "./Grid.module.css"; 

const Grid = ({ puzzle, userGrid, selectedCell, conflicts, onCellClick }) => {
  return (
    <div className={styles.sudokuGrid}>
      {puzzle.map((row, rowIndex) => (
        row.map((cell, colIndex) => {
          
          const isInitial = cell !== null;
          
        
          const isSelected = 
            selectedCell?.row === rowIndex && 
            selectedCell?.col === colIndex;
          
          
          const isError = conflicts.includes(`${rowIndex}-${colIndex}`);

          return (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              // Пріоритет: початкове число -> введене користувачем -> пустий рядок
              value={isInitial ? cell : (userGrid[rowIndex][colIndex] || "")}
              isInitial={isInitial}
              isSelected={isSelected}
              isError={isError}
              
              onClick={() => onCellClick({ row: rowIndex, col: colIndex })}
            />
          );
        })
      ))}
    </div>
  );
};

export default Grid;