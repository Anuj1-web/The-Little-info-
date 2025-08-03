import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { app } from "./firebase-config.js";

const auth = getAuth(app);
const form = document.getElementById("signupForm2");
const toast = document.getElementById("toastContainer");
const resendBtn = document.getElementById("resendBtn");
const resendContainer = document.getElementById("resendContainer");

let currentUser = null;
let resendTimer = null;
let countdown = 30;

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    currentUser = userCredential.user;
    await sendEmailVerification(currentUser);
    showToast(`Account created. Verification email sent to ${email}`, true);
    resendContainer.style.display = "block";
    startCountdown();
    form.reset();
  } catch (error) {
    showToast(error.message, false);
  }
});

resendBtn.addEventListener("click", async () => {
  if (!currentUser) return;
  try {
    await sendEmailVerification(currentUser);
    showToast("Verification email resent.", true);
    startCountdown();
  } catch (error) {
    showToast(error.message, false);
  }
});

function startCountdown() {
  resendBtn.disabled = true;
  countdown = 30;
  resendBtn.textContent = `Resend in ${countdown}s`;
  clearInterval(resendTimer);
  resendTimer = setInterval(() => {
    countdown--;
    resendBtn.textContent = countdown > 0 ? `Resend in ${countdown}s` : "Resend Email";
    if (countdown <= 0) {
      clearInterval(resendTimer);
      resendBtn.disabled = false;
    }
  }, 1000);
}

function showToast(msg, success) {
  toast.innerHTML = `<div class="toast ${success ? 'success' : 'error'}">${msg}</div>`;
  setTimeout(() => (toast.innerHTML = ""), 4000);
}
