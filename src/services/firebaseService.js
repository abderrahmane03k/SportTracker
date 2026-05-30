import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAuK8s_Mp3i_QZUkPiVtirRF3EcxPSvJeg",
  authDomain: "sporttracker-29a96.firebaseapp.com",
  projectId: "sporttracker-29a96",
  storageBucket: "sporttracker-29a96.firebasestorage.app",
  messagingSenderId: "1022710672687",
  appId: "1:1022710672687:web:51ecd16bc8dc6c990685da",
  databaseURL: "https://sporttracker-29a96-default-rtdb.europe-west1.firebaseio.com",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Firestore — pour profil, nutrition, séances
const db = getFirestore(app);

// Realtime Database — pour les données capteurs live
const rtdb = getDatabase(app);

// ─── Firestore functions ──────────────────────────────────────
export async function saveUserProfile(userId, profile) {
  await setDoc(doc(db, 'users', userId), { ...profile, updatedAt: Date.now() });
}

export async function getUserProfile(userId) {
  const snap = await getDoc(doc(db, 'users', userId));
  return snap.exists() ? snap.data() : null;
}

export async function saveSensorData(userId, data) {
  await setDoc(doc(db, 'sensors', userId), { ...data, timestamp: Date.now() });
}

export async function saveWorkout(userId, workout) {
  await addDoc(collection(db, 'workouts'), { userId, ...workout, date: Date.now() });
}

export async function saveNutrition(userId, data) {
  const today = new Date().toISOString().split('T')[0];
  await setDoc(doc(db, 'nutrition', `${userId}_${today}`), { userId, ...data, date: today });
}

export async function savePostureScore(userId, score, exercise) {
  await addDoc(collection(db, 'posture'), { userId, score, exercise, date: Date.now() });
}

export { db, rtdb };