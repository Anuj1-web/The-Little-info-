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
import { sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  console.log("Login form submitted");

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

      // Success indicator
      console.log('Login successful!');

      // ✅ Role-based redirection
      if (role?.toLowerCase() === 'admin') {
        window.location.href = 'admin-dashboard.html';
      } else {
        window.location.href = 'dashboard.html';
      }

    } else {
      alert("User data not found in Firestore.");
    }

  } catch (error) {
    console.error('Login error:', error);
    alert(error.message || 'Login failed. Please check your credentials.');
  }
});
// Password Reset
document.getElementById('forgotPasswordLink').addEventListener('click', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();

  if (!email) {
    alert("Please enter your email above to reset your password.");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    alert("Password reset email sent!");
  } catch (error) {
    console.error("Password reset error:", error);
    alert(error.message || "Failed to send reset email.");
  }
});
signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    const user = userCredential.user;

    // ⛔️ Block unverified users
    if (!user.emailVerified) {
      alert("Please verify your email before logging in.");
      signOut(auth);
      return;
    }

    // ✅ Allow access
    window.location.href = 'dashboard.html';
  })
  .catch((error) => {
    alert('Login failed: ' + error.message);
  });
