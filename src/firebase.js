import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyBia9u5Z82DSnnJvBdwCYEI5dXh2sHkDJU",
  authDomain: "sudoku-neon-c053d.firebaseapp.com",
  projectId: "sudoku-neon-c053d",
  storageBucket: "sudoku-neon-c053d.firebasestorage.app",
  messagingSenderId: "18219137903",
  appId: "1:18219137903:web:8a82439709bee0fd92469a",
  measurementId: "G-HK6G9HCW53"
};


const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;