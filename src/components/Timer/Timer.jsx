// src/components/Timer/Timer.jsx
import styles from './Timer.module.css';

const Timer = ({ seconds }) => {
  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={styles.timer}>
      {formatTime(seconds)}
    </div>
  );
};

export default Timer;