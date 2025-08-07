// firebase-login.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🔐 This config can be same or separate depending on your auth rules
const firebaseLoginConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-app-id.firebaseapp.com",
  projectId: "your-app-id",
  storageBucket: "your-app-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "APP_ID"
};

const loginApp = initializeApp(firebaseLoginConfig, "loginApp"); // named app instance
const auth = getAuth(loginApp);
const db = getFirestore(loginApp);

export { auth, db };
