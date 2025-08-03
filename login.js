import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

// ✅ Your Firebase Config (already finalized)
const firebaseConfig = {
  apiKey: "AIzaSyCpoq_sjH_XLdJ1ZRc0ECFaglvXh3FIS5Q",
  authDomain: "the-little-info.firebaseapp.com",
  projectId: "the-little-info",
  storageBucket: "the-little-info.appspot.com",
  messagingSenderId: "165711417682",
  appId: "1:165711417682:web:cebb205d7d5c1f18802a8b"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ✅ Login form handler
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (!user.emailVerified) {
      showToast("Please verify your email before logging in.", true);
    } else {
      showToast("Login successful!");
      // ✅ Redirect to dashboard after login
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1000);
    }
  } catch (error) {
    showToast(error.message, true);
  }
});

// ✅ Forgot password handler
document.getElementById("forgotPasswordLink").addEventListener("click", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  if (!email) {
    showToast("Please enter your email above before clicking forgot password.", true);
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    showToast("Password reset link sent to your email.");
  } catch (error) {
    showToast(error.message, true);
  }
});

// ✅ Toast notification function
function showToast(message, isError = false) {
  const toast = document.createElement("div");
  toast.className = `toast ${isError ? "error" : "success"}`;
  toast.textContent = message;
  document.getElementById("toast-container").appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
}
