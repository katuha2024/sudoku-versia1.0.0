import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pegas/login/Login";
import Register from"./pegas/Register/Register"; // Тепер це імпорт реєстрації
import SudokuPage from "./SudokuPage"; // Твоя гра тепер тут

function AppNew() {
  return (
    <Router>
      <Routes>
        {/* Головна сторінка — твоя гра */}
        <Route path="/" element={<SudokuPage />} />
        
        {/* Сторінка логіну */}
        <Route path="/login" element={<Login />} />
        
        {/* Якщо ти захочеш зайти на реєстрацію, якої нема, покажемо текст */}
        <Route path="/register" element={<div style={{color: 'white'}}>Тут скоро буде реєстрація...</div>} />
      </Routes>
    </Router>
  );
}

export default AppNew;