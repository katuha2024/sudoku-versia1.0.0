import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

import Header from "./components/Header/Header";
import Login from "./pegas/login/Login";
import Register from "./pegas/Register/Register";
import SudokuGame from "./components/SudokuGame/SudokuGame";

function App() {
  const [user, setUser] = useState(null);
  
  // Стан для управління грою з хедера
  const [gameState, setGameState] = useState({
    isGameStarted: false,
    isDailyActive: false,
    isStatsOpen: false,
    showDifficultyMenu: false
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Функція, яку ми віддамо в Header
  const handleMenuAction = (action) => {
    if (action === 'HOME') {
      setGameState({ isGameStarted: false, isDailyActive: false, isStatsOpen: false, showDifficultyMenu: false });
    } else if (action === 'DAILY') {
      setGameState(prev => ({ ...prev, isDailyActive: true, isGameStarted: false }));
    } else if (action === 'STATS') {
      setGameState(prev => ({ ...prev, isStatsOpen: true }));
    } else if (action === 'LEVEL') {
      setGameState(prev => ({ ...prev, showDifficultyMenu: true }));
    } else if (action === 'PLAY') {
      setGameState(prev => ({ ...prev, isGameStarted: true, isDailyActive: false }));
    }
  };

  return (
    <Router>
      <Header 
        user={user} 
        onMenuAction={handleMenuAction} 
      />
      
      <Routes>
        <Route 
          path="/" 
          element={
            <SudokuGame 
              user={user} 
              externalState={gameState} 
              setExternalState={setGameState} 
            />
          } 
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;