// login.js
import { auth } from './firebase.js';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

// ✅ DOM elements
const form = document.getElementById('loginForm');
const emailInput = document.getElementById('loginEmail');
const passwordInput = document.getElementById('loginPassword');
const toastContainer = document.getElementById('toastContainer');
const googleBtn = document.getElementById('googleSignIn');

// ✅ Toast helper
function showToast(message, isError = false) {
  const toast = document.createElement('div');
  toast.className = `toast ${isError ? 'error' : 'success'}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ✅ Email/Password Login
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  try {
    await signInWithEmailAndPassword(auth, email, password);
    showToast('✅ Logged in successfully');
    window.location.href = 'dashboard.html';
  } catch (error) {
    showToast(`❌ ${error.message}`, true);
  }
});

// ✅ Google Sign-In
googleBtn.addEventListener('click', async () => {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
    showToast('✅ Google login successful!');
    window.location.href = 'dashboard.html';
  } catch (error) {
    showToast(`❌ ${error.message}`, true);
  }
});
