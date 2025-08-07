// signup2.js
import { auth, provider } from './firebase-login.js';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
  signInWithEmailAndPassword
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signupForm2");
  const resendBtn = document.getElementById("resendVerificationBtn");
  const googleBtn = document.getElementById("googleSignupBtn");
  const verifyEmailForm = document.getElementById("verifyEmailForm");
  const verifyBtn = document.getElementById("manualVerifyBtn");
  const manualEmailInput = document.getElementById("manualEmailInput");
  const manualPasswordInput = document.getElementById("manualPasswordInput");
  const toast = document.getElementById("toastContainer");
  const goToLoginBtn = document.getElementById("goToLoginBtn");

  let cooldown = false;
  let globalCooldown = false;

  // ✅ Toast
  function showToast(msg, success = true) {
    toast.innerHTML = `<div class="toast ${success ? 'success' : 'error'}">${msg}</div>`;
    setTimeout(() => toast.innerHTML = '', 4000);
  }

  // ✅ Style Button Utility
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

  [resendBtn, googleBtn, verifyBtn].forEach(styleButton);

  // ✅ SIGNUP with Email
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (cooldown) {
      showToast("⏱️ Please wait before sending verification again.", false);
      return;
    }

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      showToast(`📩 Verification sent to ${email}`);
      resendBtn.disabled = false;
      resendBtn.textContent = "Resend Verification";
      startCooldown(resendBtn);
      signupForm.reset();
    } catch (error) {
      showToast("❌ " + error.message, false);
    }
  });

  // ✅ RESEND Button (Signup Form)
  resendBtn.addEventListener("click", async () => {
    if (cooldown || globalCooldown) {
      showToast("⏳ Please wait before resending again.", false);
      return;
    }

    const user = auth.currentUser;

    try {
      if (user) {
        await sendEmailVerification(user);
        showToast("✅ Verification resent!");
        startCooldown(resendBtn);
      } else {
        showToast("Please sign up or login first.", false);
      }
    } catch (error) {
      if (error.code === "auth/too-many-requests") {
        showToast("⛔ Too many attempts. Try later.", false);
      } else {
        showToast("❌ " + error.message, false);
      }
    }
  });

  // ✅ GOOGLE Signup
  googleBtn.addEventListener("click", async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user.emailVerified) {
        showToast("✅ Google signup successful!");
      } else {
        await sendEmailVerification(user);
        showToast("📩 Verification sent to your Google email.");
        startCooldown(googleBtn);
      }
    } catch (error) {
      showToast("❌ " + error.message, false);
    }
  });

  // ✅ MANUAL VERIFICATION BOX
  verifyEmailForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (globalCooldown) {
      showToast("⏳ Please wait before sending again.", false);
      return;
    }

    const email = manualEmailInput.value.trim();
    const password = manualPasswordInput.value;

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;

      if (user.emailVerified) {
        showToast("✅ Email is already verified.");
      } else {
        await sendEmailVerification(user);
        showToast("📩 Verification email sent!");
        startCooldown(verifyBtn, true);
      }
    } catch (error) {
      showToast("❌ " + error.message, false);
    }
  });

  // ✅ Start Cooldown Timer
  function startCooldown(button, isGlobal = false) {
    let time = 30;
    button.disabled = true;
    button.textContent = `Wait ${time}s`;
    button.style.background = "gray";
    if (isGlobal) globalCooldown = true;
    else cooldown = true;

    const interval = setInterval(() => {
      time--;
      button.textContent = `Wait ${time}s`;
      if (time <= 0) {
        clearInterval(interval);
        button.disabled = false;
        button.textContent = isGlobal ? "Send Verification" : "Resend Verification";
        styleButton(button);
        if (isGlobal) globalCooldown = false;
        else cooldown = false;
      }
    }, 1000);
  }

  // ✅ Optional: Go to Login
  if (goToLoginBtn) {
    goToLoginBtn.addEventListener("click", () => {
      window.location.href = "login.html";
    });
  }
});
