// signup2.js
import { auth } from './firebase-config.js';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

const form = document.getElementById("signupForm2");
const toast = document.getElementById("toastContainer");
const resendBtn = document.getElementById("resendVerificationBtn");
let cooldown = false;

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);

    showToast(`Verification email sent to ${email}`, true);
    resendBtn.disabled = false;
    form.reset();
  } catch (error) {
    showToast(error.message, false);
  }
});

resendBtn.addEventListener("click", async () => {
  if (cooldown) return;

  const user = auth.currentUser;
  if (user) {
    try {
      await sendEmailVerification(user);
      showToast("Verification email resent.", true);
      startCooldown();
    } catch (error) {
      showToast("Failed to resend email: " + error.message, false);
    }
  } else {
    showToast("Please sign up or login first.", false);
  }
});

function startCooldown() {
  cooldown = true;
  resendBtn.disabled = true;
  let timer = 30;
  resendBtn.textContent = `Wait ${timer}s`;

  const interval = setInterval(() => {
    timer--;
    resendBtn.textContent = `Wait ${timer}s`;
    if (timer <= 0) {
      clearInterval(interval);
      cooldown = false;
      resendBtn.disabled = false;
      resendBtn.textContent = "Resend Verification";
    }
  }, 1000);
}

function showToast(msg, success) {
  toast.innerHTML = `<div class="toast ${success ? 'success' : 'error'}">${msg}</div>`;
  setTimeout(() => (toast.innerHTML = ""), 4000);
}
