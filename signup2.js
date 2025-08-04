// signup2.js
import { auth } from './firebase-config.js';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signupForm2");
  const toast = document.getElementById("toastContainer");
  const resendBtn = document.getElementById("resendVerificationBtn");
  let cooldown = false;

  // Apply consistent site-wide button style
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

  styleButton(resendBtn); // initial styling

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
      resendBtn.textContent = "Resend Verification";
      styleButton(resendBtn);
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
        if (error.code === "auth/too-many-requests") {
          showToast("Too many requests. Please wait before retrying.", false);
          startCooldown();
        } else {
          showToast("Failed to resend email: " + error.message, false);
        }
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
    resendBtn.style.background = "gray";

    const interval = setInterval(() => {
      timer--;
      resendBtn.textContent = `Wait ${timer}s`;
      if (timer <= 0) {
        clearInterval(interval);
        cooldown = false;
        resendBtn.disabled = false;
        resendBtn.textContent = "Resend Verification";
        styleButton(resendBtn);
      }
    }, 1000);
  }

  function showToast(msg, success) {
    toast.innerHTML = `<div class="toast ${success ? 'success' : 'error'}">${msg}</div>`;
    setTimeout(() => (toast.innerHTML = ""), 4000);
  }
});
