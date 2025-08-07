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
import { sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

const forgotLink = document.getElementById('forgotPasswordLink');

// ✅ Handle Forgot Password
forgotLink.addEventListener('click', async (e) => {
  e.preventDefault();

  const email = prompt('Enter your email to reset password:');
  if (!email) return;

  try {
    await sendPasswordResetEmail(auth, email);
    showToast(`📩 Password reset email sent to ${email}`);
  } catch (error) {
    showToast(`❌ ${error.message}`, true);
  }
});
import {
  getFirestore,
  doc,
  getDoc
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

import { app } from './firebase.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

const db = getFirestore(app);
const auth = getAuth(app);

// ✅ Admin Role Check and Redirect (after login)
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const role = userDoc.data().role;
      if (role === 'admin') {
        window.location.href = 'admin-dashboard.html';
      } else {
        window.location.href = 'dashboard.html';
      }
    } else {
      console.warn('User role not found.');
    }
  } catch (error) {
    console.error('🔥 Error checking admin role:', error);
  }
});
