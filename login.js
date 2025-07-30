// login.js
import { auth } from './firebaseInit.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (user.emailVerified) {
      alert("Login successful!");
      window.location.href = "profile.html"; // ✅ Redirect to user profile
    } else {
      alert("Please verify your email before logging in.");
    }
  } catch (error) {
    console.error("Login error:", error.message);
    alert("Invalid email or password. Please try again.");
  }
});
