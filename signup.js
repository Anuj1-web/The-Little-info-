import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCpoq_sjH_XLdJ1ZRc0ECFaglvXh3FIS5Q",
  authDomain: "the-little-info.firebaseapp.com",
  projectId: "the-little-info",
  storageBucket: "the-little-info.firebasestorage.app",
  messagingSenderId: "165711417682",
  appId: "1:165711417682:web:cebb205d7d5c1f18802a8b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const signupForm = document.getElementById("signupForm");
const toastContainer = document.getElementById("toastContainer");

function showToast(message, isError = false) {
  const toast = document.createElement("div");
  toast.className = `toast ${isError ? "error" : "success"}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();

  if (!email || !password || !confirmPassword) {
    showToast("Please fill all fields.", true);
    return;
  }

  if (password.length < 6) {
    showToast("Password must be at least 6 characters.", true);
    return;
  }

  if (password !== confirmPassword) {
    showToast("Passwords do not match.", true);
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await sendEmailVerification(user);
    showToast("✅ Verification email sent! Please check your inbox.");

    let attempts = 0;
    const maxAttempts = 36; // 3 minutes / 5 sec
    const interval = setInterval(async () => {
      await user.reload();
      if (user.emailVerified) {
        clearInterval(interval);
        showToast("🎉 Email verified! Redirecting...");
        setTimeout(() => window.location.href = "login.html", 2000);
      } else {
        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          showToast("❌ Verification timed out. Try again.", true);
          await signOut(auth);
        }
      }
    }, 5000);

  } catch (error) {
    console.error(error);
    showToast(error.message, true);
  }
});
