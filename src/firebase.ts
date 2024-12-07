import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB5eC6I4uxX_WruzWzANKTyL34AFT0Q2Aw",
  authDomain: "legendsofempire-7bee7.firebaseapp.com",
  projectId: "legendsofempire-7bee7",
  storageBucket: "legendsofempire-7bee7.firebasestorage.app",
  messagingSenderId: "291096064853",
  appId: "1:291096064853:web:bc5f23fa5cc2edc436f5dc",
  measurementId: "G-WYT95XV4XJ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
