// firebaseInit.js

// ✅ Import the firebaseConfig from firebase.js
import { firebaseConfig } from './firebase.js';

// ✅ Import the required Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ✅ Initialize Firebase app only once
const app = initializeApp(firebaseConfig);

// ✅ Initialize services
const db = getFirestore(app);
const auth = getAuth(app);

// ✅ Optional: log to console for confirmation
console.log("Firebase initialized successfully.");

// ✅ Export initialized services if other modules need them
export { db, auth };
