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
      const role = userData.role;
      console.log("Logged in user role:", role);

      alert('Login successful!');

      if (role === 'admin') {
        window.location.href = 'admin-dashboard.html';
      } else {
        window.location.href = 'dashboard.html';
      }
    } else {
      alert("User data not found in database.");
    }

  } catch (error) {
    console.error('Login error:', error);
    alert(error.message || 'Login failed. Please check your credentials.');
  }
});
