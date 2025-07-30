// login.js
import { auth } from './firebaseInit.js';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

const loginForm = document.getElementById("loginForm");
const message = document.getElementById("loginMessage");
const resendLink = document.getElementById("resendLink");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (user.emailVerified) {
      message.textContent = "Login successful!";
      if (user.email === "thelittleinfo01@gmail.com") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "index.html";
      }
    } else {
      await signOut(auth);
      message.textContent = "Please verify your email first.";
      resendLink.style.display = "inline";
    }

  } catch (error) {
    message.textContent = "Login failed: " + error.message;
  }
});

// ✅ Resend Verification Email
resendLink.addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (!user.emailVerified) {
      await sendEmailVerification(user);
      message.textContent = "Verification email sent. Check your inbox.";
      await signOut(auth);
    }

  } catch (error) {
    message.textContent = "Error resending email: " + error.message;
  }
});
