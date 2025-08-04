// auth-guard.js
import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      // Not logged in → redirect to login
      window.location.href = "login.html";
    } else if (!user.emailVerified) {
      // Logged in but email not verified → force logout and redirect
      await signOut(auth);
      alert("Please verify your email to continue.");
      window.location.href = "login.html";
    }
    // else: user is logged in AND email is verified → do nothing
  });
});
