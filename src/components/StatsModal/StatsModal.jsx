import React from 'react';
import styles from './StatsModal.module.css';

const StatsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const savedData = localStorage.getItem("sudoku_stats");
  const stats = savedData ? JSON.parse(savedData) : {
    totalWins: 0,
    bestTimes: { easy: null, medium: null, hard: null }
  };

  const formatTime = (s) => {
    if (!s) return "--:--";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className="neon-title">СТАТИСТИКА</h2>
        <div className={styles.statLine}>
          <span>ПЕРЕМОГ:</span>
          <span className={styles.value}>{stats.totalWins}</span>
        </div>
        <hr className={styles.divider} />
        <h3>НАЙКРАЩИЙ ЧАС:</h3>
        <div className={styles.levelRow}>
          <span>EASY:</span> <span>{formatTime(stats.bestTimes.easy)}</span>
        </div>
        <div className={styles.levelRow}>
          <span>MEDIUM:</span> <span>{formatTime(stats.bestTimes.medium)}</span>
        </div>
        <div className={styles.levelRow}>
          <span>HARD:</span> <span>{formatTime(stats.bestTimes.hard)}</span>
        </div>
        <button className="new-game-btn" onClick={onClose}>Закрити</button>
      </div>
    </div>
  );
};

export default StatsModal;