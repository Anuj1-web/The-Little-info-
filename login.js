import { auth } from "./firebaseInit.js";
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const resendLink = document.getElementById("resendLink");
const forgotPasswordLink = document.getElementById("forgotPasswordLink");

let currentEmail = "";

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (!user.emailVerified) {
      loginMessage.textContent = "Please verify your email before logging in.";
      resendLink.style.display = "inline";
      currentEmail = email;
      return;
    }

    loginMessage.textContent = "Login successful!";
    window.location.href = user.email === "thelittleinfo01@gmail.com" ? "admin.html" : "index.html";

  } catch (err) {
    loginMessage.textContent = "Login failed: " + err.message;
  }
});

resendLink.addEventListener("click", async () => {
  if (!currentEmail) return;
  try {
    const userCredential = await signInWithEmailAndPassword(auth, currentEmail, document.getElementById("loginPassword").value);
    await sendEmailVerification(userCredential.user);
    loginMessage.textContent = "Verification email resent. Please check your inbox.";
  } catch (err) {
    loginMessage.textContent = "Failed to resend verification email: " + err.message;
  }
});

forgotPasswordLink.addEventListener("click", async (e) => {
  e.preventDefault();
  const email = prompt("Enter your registered email to reset password:");
  if (!email) return;
  try {
    await sendPasswordResetEmail(auth, email);
    alert("Password reset email sent. Please check your inbox.");
  } catch (err) {
    alert("Error sending reset email: " + err.message);
  }
});
