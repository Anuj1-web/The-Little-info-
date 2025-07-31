// auth.js
import { auth } from './firebase.js';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('loginEmail');
const passwordInput = document.getElementById('loginPassword');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        alert('⚠ Please verify your email before logging in.');
        await signOut(auth);
        return;
      }

      alert(`✅ Welcome, ${user.email}`);
      window.location.href = 'dashboard.html';
    } catch (error) {
      alert(`❌ Login failed: ${error.message}`);
      console.error('Login error:', error);
    }
  });
}

// Optional: Protect restricted pages
export function protectPage(redirectTo = 'login.html') {
  onAuthStateChanged(auth, (user) => {
    if (!user || !user.emailVerified) {
      alert('Access denied. Please log in with a verified account.');
      window.location.href = redirectTo;
    }
  });
}
