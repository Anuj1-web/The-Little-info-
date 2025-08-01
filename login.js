// login.js
import { auth, db } from './firebase.js';
import {
  signInWithEmailAndPassword,
  signOut
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import {
  doc,
  getDoc
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (!user.emailVerified) {
      alert('Please verify your email before logging in.');
      await signOut(auth);
      return;
    }

    // ✅ Fetch user role from Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      const role = (userData.role || '').toLowerCase();

      console.log("✅ Logged in User UID:", user.uid);
      console.log("✅ Retrieved role from Firestore:", role);

      // Don't use alert here to avoid blocking redirect
      console.log('Login successful!');

      if (role === 'admin') {
        console.log('🔁 Redirecting to admin-dashboard.html');
        window.location.href = 'admin-dashboard.html';
      } else {
        console.log('🔁 Redirecting to dashboard.html');
        window.location.href = 'dashboard.html';
      }
    } else {
      console.warn("❌ User data not found in Firestore for UID:", user.uid);
      alert("User data not found. Please contact support.");
    }

  } catch (error) {
    console.error('Login error:', error);
    alert(error.message || 'Login failed. Please check your credentials.');
  }
});
