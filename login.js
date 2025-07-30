// login.js
import { auth } from './firebaseInit.js';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

const loginForm = document.getElementById("loginForm");
const message = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // ✅ Check if email is verified
    if (user.emailVerified) {
      message.textContent = "Login successful!";
      // Redirect based on admin or user
      if (user.email === "thelittleinfo01@gmail.com") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "index.html";
      }
    } else {
      await signOut(auth); // Sign user out immediately
      message.textContent = "Please verify your email before logging in.";
    }

  } catch (error) {
    message.textContent = "Login failed: " + error.message;
  }
});
