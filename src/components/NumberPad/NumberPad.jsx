import { Lightbulb } from "lucide-react";
import styles from "./NumberPad.module.css";

// Додаємо hintsLeft у деструктуризацію пропсів
const NumberPad = ({ completedNumbers, activeCellValue, onNumberClick, onHintClick, hintsLeft, disabled = false }) => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className={styles.numberPad}>
      {numbers.map((num) => {
        const isDone = completedNumbers[num] >= 9;
        
        return (
          <button
            key={num}
            className={`${styles.padBtn} ${activeCellValue === num ? styles.active : ""} ${isDone ? styles.hidden : ""}`}
            onClick={() => onNumberClick(num)}
            disabled={isDone || disabled}
          >
            {num}
          </button>
        );
      })}
      
      {/* Кнопка підказки з лічильником */}
      <button 
        className={`${styles.padBtn} ${styles.hintBtn} ${hintsLeft === 0 || disabled ? styles.disabled : ""}`} 
        onClick={onHintClick}
        disabled={hintsLeft === 0 || disabled} // Кнопка перестає натискатися, якщо підказок 0
      >
        <Lightbulb size={20} />
        {/* Відображаємо кількість підказок, якщо вони є */}
        <span className={styles.hintBadge}>{hintsLeft}</span>
      </button>
    </div>
  );
};

export default NumberPad;