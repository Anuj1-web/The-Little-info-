// Firebase Auth Login Script with Toast + Password Reset

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCpoq_sjH_XLdJ1ZRc0ECFaglvXh3FIS5Q",
  authDomain: "the-little-info.firebaseapp.com",
  projectId: "the-little-info",
  storageBucket: "the-little-info.firebasestorage.app",
  messagingSenderId: "165711417682",
  appId: "1:165711417682:web:cebb205d7d5c1f18802a8b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ✅ Inject toast CSS if not already present
function injectToastCSS() {
  const style = document.createElement("style");
  style.textContent = `
    .toast {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #323232;
      color: #fff;
      padding: 12px 18px;
      border-radius: 5px;
      opacity: 0;
      transition: opacity 0.5s ease, bottom 0.5s ease;
      z-index: 9999;
      font-size: 14px;
    }
    .toast.show {
      opacity: 1;
      bottom: 30px;
    }
    .toast.success { background-color: #4CAF50; }
    .toast.error { background-color: #f44336; }
  `;
  document.head.appendChild(style);
}

injectToastCSS();

// ✅ Toast function
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 100);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 500);
  }, 3500);
}

// ✅ Handle Login
document.getElementById("login-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (!user.emailVerified) {
      showToast("Please verify your email before logging in.", "error");
      return;
    }

    showToast("Login successful!", "success");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);
  } catch (error) {
    showToast("Login failed: " + error.message, "error");
    console.error(error);
  }
});

// ✅ Handle Forgot Password
document.getElementById("forgot-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("forgot-email").value;
  try {
    await sendPasswordResetEmail(auth, email);
    showToast("Password reset email sent!", "success");
  } catch (error) {
    showToast("Error: " + error.message, "error");
    console.error(error);
  }
});
