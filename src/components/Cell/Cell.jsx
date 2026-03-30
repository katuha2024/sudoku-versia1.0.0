// src/components/Grid/Cell.jsx
import styles from "./Cell.module.css"; // Імпортуємо об'єкт стилів

const Cell = ({ value, isInitial, isSelected, isError, onClick }) => {
  // Формуємо список класів через об'єкт styles
  const cellClasses = [
    styles.cell,
    isInitial ? styles.initial : styles.userInput,
    isSelected ? styles.active : "",
    isError ? styles.error : ""
  ].join(" ").trim();

  return (
    <div className={cellClasses} onClick={onClick}>
      {value}
    </div>
  );
};

export default Cell;