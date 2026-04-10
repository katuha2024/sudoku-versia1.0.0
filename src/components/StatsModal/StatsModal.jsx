import React from 'react';
import styles from './StatsModal.module.css';

const StatsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const savedData = localStorage.getItem("sudoku_stats");
  
  // Додаємо dailyWins у дефолтний об'єкт, якщо даних ще немає
  const stats = savedData ? JSON.parse(savedData) : {
    wins: 0,
    dailyWins: 0,
    bestTimes: { EASY: null, MEDIUM: null, HARD: null }
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
          {/* Використовуємо stats.wins, як ми прописали в AppNew.jsx */}
          <span className={styles.value}>{stats.wins || 0}</span>
        </div>

        {/* НОВИЙ РЯДОК ДЛЯ ЩОДЕННИХ ГОЛОВОЛОМОК */}
        <div className={styles.statLine}>
          <span>ЩОДЕННІ:</span>
          <span className={styles.value} style={{ color: '#00f2ff' }}>
            {stats.dailyWins || 0}
          </span>
        </div>

        <hr className={styles.divider} />
        
        <h3>НАЙКРАЩИЙ ЧАС:</h3>
        <div className={styles.levelRow}>
          {/* Зверни увагу на регістр EASY/easy, він має збігатися з AppNew.jsx */}
          <span>EASY:</span> <span>{formatTime(stats.bestTimes.EASY || stats.bestTimes.easy)}</span>
        </div>
        <div className={styles.levelRow}>
          <span>MEDIUM:</span> <span>{formatTime(stats.bestTimes.MEDIUM || stats.bestTimes.medium)}</span>
        </div>
        <div className={styles.levelRow}>
          <span>HARD:</span> <span>{formatTime(stats.bestTimes.HARD || stats.bestTimes.hard)}</span>
        </div>
        
        <button className="new-game-btn" style={{ marginTop: '20px' }} onClick={onClose}>
          Закрити
        </button>
      </div>
    </div>
  );
};

export default StatsModal;