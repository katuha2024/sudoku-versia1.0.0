// src/components/DifficultyMenu/DifficultyMenu.jsx
import styles from './DifficultyMenu.module.css';

const DifficultyMenu = ({ onSelect, onCancel }) => {
  const levels = ["easy", "medium", "hard"];

  return (
    <div className={styles.overlay}>
      <p className={styles.title}>Оберіть складність:</p>
      <div className={styles.options}>
        {levels.map((level) => (
          <button 
            key={level} 
            className={styles.diffBtn} 
            onClick={() => onSelect(level)}
          >
            {level}
          </button>
        ))}
      </div>
      <button className={styles.cancelBtn} onClick={onCancel}>
        Скасувати
      </button>
    </div>
  );
};

export default DifficultyMenu;