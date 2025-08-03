import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification
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
const sendVerificationBtn = document.getElementById("sendVerificationBtn");
const verificationStatus = document.getElementById("verificationStatus");

let currentUser = null;
let emailVerified = false;
let verificationTimer = null;

// ✅ Show toast messages
function showToast(message, isError = false) {
  const toast = document.createElement("div");
  toast.className = `toast ${isError ? "error" : "success"}`;
  toast.textContent = message;
  document.getElementById("toastContainer").appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ✅ Send verification link
sendVerificationBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();

  if (!email || !password || !confirmPassword) {
    showToast("All fields are required.", true);
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
    currentUser = userCredential.user;

    await sendEmailVerification(currentUser);
    showToast("Verification email sent. Check your inbox.");

    let checks = 0;
    verificationStatus.textContent = "⏳ Waiting for email verification...";

    verificationTimer = setInterval(async () => {
      await currentUser.reload();
      if (currentUser.emailVerified) {
        clearInterval(verificationTimer);
        emailVerified = true;
        verificationStatus.textContent = "✅ Email verified. You may now finish signup.";
        showToast("Email verified successfully.");
      }
      checks++;
      if (checks >= 36) { // 3 minutes
        clearInterval(verificationTimer);
        if (!emailVerified) {
          verificationStatus.textContent = "❌ Verification timeout. Try again.";
          showToast("Email not verified in time. Please resend.", true);
        }
      }
    }, 5000);
  } catch (error) {
    showToast(error.message, true);
  }
});

// ✅ Complete signup only after verification
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!emailVerified) {
    showToast("Please verify your email before completing signup.", true);
    return;
  }

  showToast("Signup complete! Redirecting...");
  setTimeout(() => {
    window.location.href = "login.html";
  }, 1500);
});
