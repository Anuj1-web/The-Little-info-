// firebaseInit.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js";
import { firebaseConfig } from './firebase.js';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Export initialized services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
