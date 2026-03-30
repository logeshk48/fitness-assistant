// Import the functions you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // ✅ ADD THIS

const firebaseConfig = {
  apiKey: "AIzaSyD99LO1UNGSI...",
  authDomain: "fitness-assistant-ed4a3.firebaseapp.com",
  projectId: "fitness-assistant-ed4a3",
  storageBucket: "fitness-assistant-ed4a3.appspot.com",
  messagingSenderId: "835637337658",
  appId: "1:835637337658:web:567c928e2e0debae599f03"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ ADD THIS LINE
export const db = getFirestore(app);