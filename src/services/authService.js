import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { saveUserProfile } from './firebaseService';

const firebaseConfig = {
  apiKey: "AIzaSyAuK8s_Mp3i_QZUkPiVtirRF3EcxPSvJeg",
  authDomain: "sporttracker-29a96.firebaseapp.com",
  projectId: "sporttracker-29a96",
  storageBucket: "sporttracker-29a96.firebasestorage.app",
  messagingSenderId: "1022710672687",
  appId: "1:1022710672687:web:51ecd16bc8dc6c990685da",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export async function registerUser(email, password, profile) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await saveUserProfile(cred.user.uid, profile);
  return cred.user;
}

export async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function logoutUser() {
  await signOut(auth);
}

export { auth };