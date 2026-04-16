import React, { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom"; // Додали навігацію всередину
import styles from "./Header.module.css";

const Header = ({ user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Функція для зміни режиму гри через URL
  const handleAction = (mode) => {
    navigate(`/?mode=${mode}`);
    setIsMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo} onClick={() => navigate("/")}>
        sudoku<span>.</span>neon
      </div>

      <div className={styles.centerMenu}>
        <div className={styles.dropdown}>
          <button className={styles.dropBtn} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            MENU {isMenuOpen ? "▴" : "▾"}
          </button>
          
          {isMenuOpen && (
            <div className={styles.dropContent} onMouseLeave={() => setIsMenuOpen(false)}>
              <button onClick={() => handleAction('play')}>PLAY NOW</button>
              <button onClick={() => handleAction('daily')}>DAILY CHALLENGE</button>
              <button onClick={() => handleAction('stats')}>STATISTICS</button>
              <button onClick={() => handleAction('level')}>CHANGE LEVEL</button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.authZone}>
        {user ? (
          <div className={styles.userInfo}>
            <span className={styles.userEmail}>{user.email?.split('@')[0]}</span>
            <button className={styles.authBtn} onClick={() => signOut(auth)}>EXIT</button>
          </div>
        ) : (
          <div className={styles.authLinks}>
            <button className={styles.authBtn} onClick={() => navigate("/login")}>LOGIN</button>
            <span className={styles.divider}>/</span>
            <button className={styles.authBtn} onClick={() => navigate("/register")}>SIGN UP</button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;