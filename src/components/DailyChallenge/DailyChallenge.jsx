import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; 
import styles from './DailyChallenge.module.css'; // Імпортуємо як styles для модульного CSS

const DailyChallenge = ({ onDateSelect }) => {
  const [date, setDate] = useState(new Date());

  // Отримуємо список пройдених днів прямо під час рендеру
  const completedDays = JSON.parse(localStorage.getItem("sudoku_completed_days") || "[]");

  const handleDateChange = (newDate) => {
    setDate(newDate);
    onDateSelect(newDate);
  };

  // Функція, яка дод
  const getTileClassName = ({ date, view }) => {
    if (view === 'month') {
      
      const offset = date.getTimezoneOffset() * 60000;
      const localDate = new Date(date.getTime() - offset).toISOString().split('T')[0];
      
      if (completedDays.includes(localDate)) {
        return styles.completedDay; // Додаємо неоновий клас
      }
    }
    return null;
  };

  return (
    <div className={styles.daily_container}>
      <h2 className="main-title" style={{ fontSize: '2.5rem', textAlign: 'center' }}>Daily Challenge</h2>
      <div className={styles.calendar_wrapper}>
        <Calendar 
          onChange={handleDateChange} 
          value={date}
          minDetail="month"
          next2Label={null}
          prev2Label={null}
          tileClassName={getTileClassName} // Вмикаємо підсвітку
        />
      </div>
    </div>
  );
};

export default DailyChallenge;