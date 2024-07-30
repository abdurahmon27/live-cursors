import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBjm9j6rrrqOluf8xDRHSZ-QMxv55LaQSE",
  authDomain: "friends-quiz-app-uz.firebaseapp.com",
  projectId: "friends-quiz-app-uz",
  storageBucket: "friends-quiz-app-uz.appspot.com",
  messagingSenderId: "307779882524",
  appId: "1:307779882524:web:946372c522c65fe7a3d9d9",
  measurementId: "G-7HNLNHHNNK"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, onAuthStateChanged, signInAnonymously };

