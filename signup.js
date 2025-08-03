import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { firebaseConfig } from './firebase.js';

// ✅ Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ✅ Elements
const signupForm = document.getElementById("signupForm");
const resendBtn = document.getElementById("resendVerifyBtn");
const toastContainer = document.getElementById("toastContainer");

function showToast(message, isError = false) {
  const toast = document.createElement("div");
  toast.className = `toast ${isError ? "error" : "success"}`;
  toast.innerText = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ✅ Signup Flow
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value.trim();

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // ✅ Send email verification
    await sendEmailVerification(user);
    showToast("Verification email sent. Please check your inbox.");

    // ✅ Show resend option after 30 seconds
    resendBtn.style.display = "inline-block";
    resendBtn.disabled = true;
    resendBtn.innerText = "Resend in 30s";

    let countdown = 30;
    const interval = setInterval(() => {
      countdown--;
      resendBtn.innerText = `Resend in ${countdown}s`;
      if (countdown === 0) {
        clearInterval(interval);
        resendBtn.disabled = false;
        resendBtn.innerText = "Resend Verification";
      }
    }, 1000);
  } catch (error) {
    console.error(error);
    showToast(error.message, true);
  }
});

// ✅ Resend Email
resendBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (user) {
    try {
      await sendEmailVerification(user);
      showToast("Verification email resent.");
      resendBtn.disabled = true;
      resendBtn.innerText = "Resend in 30s";
      let countdown = 30;
      const interval = setInterval(() => {
        countdown--;
        resendBtn.innerText = `Resend in ${countdown}s`;
        if (countdown === 0) {
          clearInterval(interval);
          resendBtn.disabled = false;
          resendBtn.innerText = "Resend Verification";
        }
      }, 1000);
    } catch (error) {
      console.error(error);
      showToast("Error resending verification email.", true);
    }
  } else {
    showToast("No user found. Please sign up again.", true);
  }
});
