import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  // Replace with your Firebase config
  apiKey: "AIzaSyCE9j7ln9hJOeYDae5aiVucPndvHKJe-5c",
    authDomain: "anymenu-37781.firebaseapp.com",
    projectId: "anymenu-37781",
    storageBucket: "anymenu-37781.firebasestorage.app",
    messagingSenderId: "212938959085",
    appId: "1:212938959085:web:a4888cc8e09b2dc215c4e4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);