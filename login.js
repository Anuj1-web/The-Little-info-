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

    // Redirect based on email
    if (user.email === "thelittleinfo01@gmail.com") {
      window.location.href = "admin.html"; // Admin dashboard
    } else {
      window.location.href = "user-home.html"; // User homepage
    }
  } catch (error) {
    alert("Login failed: " + error.message);
  }
});
