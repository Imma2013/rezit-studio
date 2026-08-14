// Firebase configuration for Rezit Studio
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB-oG7oPVnFAaR_g1wi82OJbNChoxxaS2s",
  authDomain: "resit-studio-202608.firebaseapp.com",
  projectId: "resit-studio-202608",
  storageBucket: "resit-studio-202608.firebasestorage.app",
  messagingSenderId: "957565987462",
  appId: "1:957565987462:web:8f12514aefb461808eff07",
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export async function loginWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export async function logoutFirebase() {
  return signOut(auth);
}

export { onAuthStateChanged };
export type { FirebaseUser };
