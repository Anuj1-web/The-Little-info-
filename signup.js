// signup.js
import { auth } from './firebaseInit.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

document.getElementById("signup-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value.trim();

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Signup successful! Please login.");
    window.location.href = "login.html";
  } catch (error) {
    alert("Signup failed: " + error.message);
  }
});
