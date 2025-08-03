// signup.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCpoq_sjH_XLdJ1ZRc0ECFaglvXh3FIS5Q",
  authDomain: "the-little-info.firebaseapp.com",
  projectId: "the-little-info",
  storageBucket: "the-little-info.firebasestorage.app",
  messagingSenderId: "165711417682",
  appId: "1:165711417682:web:cebb205d7d5c1f18802a8b"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ✅ Toast Helper
function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerText = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ✅ Resend Verification Setup
let resendBtn = document.getElementById("resendVerificationBtn");
let currentUser = null;

function enableResendButton() {
  resendBtn.style.display = "block";
  resendBtn.disabled = false;
}

resendBtn.addEventListener("click", async () => {
  if (currentUser) {
    resendBtn.disabled = true;
    try {
      await sendEmailVerification(currentUser);
      showToast("Verification email resent!", "success");
      setTimeout(() => (resendBtn.disabled = false), 30000);
    } catch (err) {
      showToast("Error resending email", "error");
    }
  }
});

// ✅ Signup Handler
document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;

  if (!name || !email || password.length < 6) {
    showToast("Please fill all fields correctly.", "error");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    currentUser = userCredential.user;

    await sendEmailVerification(currentUser);
    showToast("Account created! Verification email sent.", "success");

    await signOut(auth);

    setTimeout(enableResendButton, 30000);
  } catch (error) {
    showToast(error.message, "error");
  }
});
