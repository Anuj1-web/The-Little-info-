import { auth, db } from './firebase.js';
import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import {
  doc,
  getDoc
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { showToast } from './toast.js'; // ✅ Make sure you have this

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // ⛔ Unverified email check
    if (!user.emailVerified) {
      showToast('Please verify your email before logging in.', 'error');
      await signOut(auth);
      return;
    }

    // ✅ Fetch user document
    const userDocSnap = await getDoc(doc(db, 'users', user.uid));
    if (!userDocSnap.exists()) {
      showToast('User data not found in Firestore.', 'error');
      await signOut(auth);
      return;
    }

    const userData = userDocSnap.data();
    const role = userData.role?.toLowerCase() || 'user';

    showToast('Login successful!', 'success');

    setTimeout(() => {
      if (role === 'admin') {
        window.location.href = 'admin-dashboard.html';
      } else {
        window.location.href = 'dashboard.html';
      }
    }, 1000);

  } catch (error) {
    console.error('Login Error:', error);
    showToast(error.message || 'Login failed. Please check your credentials.', 'error');
  }
});

// ✅ Password Reset Handler
document.getElementById('forgotPasswordLink').addEventListener('click', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();

  if (!email) {
    showToast('Please enter your email above to reset your password.', 'error');
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    showToast('Password reset email sent!', 'success');
  } catch (error) {
    console.error("Password reset error:", error);
    showToast(error.message || "Failed to send reset email.", 'error');
  }
});
