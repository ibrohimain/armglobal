/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB0hryLYMs3zenkOlF7F6bH0Ai7ok6uMXs",
  authDomain: "armglobal-a80eb.firebaseapp.com",
  projectId: "armglobal-a80eb",
  storageBucket: "armglobal-a80eb.firebasestorage.app",
  messagingSenderId: "357044162472",
  appId: "1:357044162472:web:82346c97747a09a9f8179d",
  measurementId: "G-JZXY0F7H90"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Make local persistence explicitly selected (highly recommended for local usage)
try {
  setPersistence(auth, browserLocalPersistence);
} catch (error) {
  console.error("Firebase persistence error:", error);
}

// Safely configure and export analytics
export const analyticsPromise = isSupported().then((supported) => {
  return supported ? getAnalytics(app) : null;
}).catch(() => null);
