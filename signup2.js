// signup2.js
import { auth } from './firebase-login.js';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signupForm2");
  const toast = document.getElementById("toastContainer");
  const resendBtn = document.getElementById("resendVerificationBtn");
  let cooldown = false;

  // ✅ Reusable Toast
  function showToast(msg, success = true) {
    toast.innerHTML = `<div class="toast ${success ? 'success' : 'error'}">${msg}</div>`;
    setTimeout(() => (toast.innerHTML = ""), 4000);
  }

  // ✅ Button Styling
  function styleButton(btn) {
    btn.style.padding = "10px 20px";
    btn.style.borderRadius = "10px";
    btn.style.border = "none";
    btn.style.cursor = "pointer";
    btn.style.fontWeight = "600";
    btn.style.marginTop = "12px";
    btn.style.transition = "all 0.3s ease";
    btn.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
    btn.style.fontSize = "15px";
    btn.style.background = "var(--accent)";
    btn.style.color = "var(--btnText)";
  }

  styleButton(resendBtn); // Initial style

  // ✅ Signup Form Submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);

      showToast(`📨 Verification email sent to ${email}`);
      resendBtn.disabled = false;
      resendBtn.textContent = "Resend Verification";
      styleButton(resendBtn);
      form.reset();
    } catch (error) {
      showToast("❌ " + error.message, false);
      console.error("Signup error:", error);
    }
  });

  // ✅ Resend Verification Logic
  resendBtn.addEventListener("click", async () => {
    if (cooldown) return;

    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value;

    let user = auth.currentUser;

    try {
      if (!user && email && password) {
        // Try re-signing in silently
        const credential = await signInWithEmailAndPassword(auth, email, password);
        user = credential.user;
      }

      if (user) {
        await sendEmailVerification(user);
        showToast("📨 Verification email resent!");
        startCooldown();
      } else {
        showToast("⚠️ Please enter your email & password to resend.", false);
      }
    } catch (error) {
      if (error.code === "auth/too-many-requests") {
        showToast("⚠️ Too many attempts. Please wait.", false);
      } else {
        showToast("❌ Failed to resend: " + error.message, false);
      }
      console.error("Resend error:", error);
    }
  });

  // ✅ Cooldown Timer for Resend
  function startCooldown() {
    cooldown = true;
    resendBtn.disabled = true;
    let seconds = 30;
    resendBtn.textContent = `Wait ${seconds}s`;
    resendBtn.style.background = "gray";

    const interval = setInterval(() => {
      seconds--;
      resendBtn.textContent = `Wait ${seconds}s`;
      if (seconds <= 0) {
        clearInterval(interval);
        cooldown = false;
        resendBtn.disabled = false;
        resendBtn.textContent = "Resend Verification";
        styleButton(resendBtn);
      }
    }, 1000);
  }

  // ✅ Redirect Button to Login
  const goToLoginBtn = document.getElementById("goToLoginBtn");
  if (goToLoginBtn) {
    goToLoginBtn.addEventListener("click", () => {
      window.location.href = "login.html";
    });
  }
});
