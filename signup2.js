// signup2.js (Fully working with Google Signup, resend cooldown, manual verification box)
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

import {
  getFirestore,
  doc,
  setDoc
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

import { app } from './firebase-login.js';

const auth = getAuth(app);
const db = getFirestore(app);

const form = document.getElementById("signupForm2");
const toast = document.getElementById("toastContainer");
const resendBtn = document.getElementById("resendVerificationBtn");
const goToLoginBtn = document.getElementById("goToLoginBtn");
const googleSignupBtn = document.getElementById("googleSignupBtn");
const verifyEmailBtn = document.getElementById("verifyEmailBtn");
const verifyEmailInput = document.getElementById("verifyEmailInput");

let cooldown = false;

function showToast(msg, success = true) {
  const div = document.createElement("div");
  div.className = `toast ${success ? 'success' : 'error'}`;
  div.textContent = msg;
  toast.appendChild(div);
  setTimeout(() => div.remove(), 4000);
}

function styleButton(btn) {
  if (!btn) return;
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

[resendBtn, goToLoginBtn, googleSignupBtn, verifyEmailBtn].forEach(styleButton);

// ✅ Signup Email/Password
form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCred.user;

    await sendEmailVerification(user); // ✅ FIX: use user directly here
    await setDoc(doc(db, "users", user.uid), {
      email,
      name,
      role: "user"
    });

    showToast(`Verification email sent to ${email}`, true);
    resendBtn.disabled = false;
    startCooldown();
    form.reset();
  } catch (error) {
    showToast(error.message, false);
  }
});

// ✅ Resend Verification Email
resendBtn?.addEventListener("click", async () => {
  if (cooldown) return;

  const user = auth.currentUser;
  if (user) {
    try {
      await sendEmailVerification(user);
      showToast("Verification email resent.");
      startCooldown();
    } catch (error) {
      showToast("Resend error: " + error.message, false);
      if (error.code === "auth/too-many-requests") {
        startCooldown();
      }
    }
  } else {
    showToast("Please sign up or login first.", false);
  }
});

// ✅ Manual Email Verification by Input
verifyEmailBtn?.addEventListener("click", async () => {
  const email = verifyEmailInput?.value.trim();
  if (!email) return showToast("Please enter a valid email.", false);

  try {
    const user = auth.currentUser;
    if (user?.email === email) {
      await sendEmailVerification(user);
      showToast("Verification sent to your email.");
    } else {
      showToast("Login again with this email to resend verification.", false);
    }
  } catch (error) {
    showToast("Error: " + error.message, false);
  }
});

// ✅ Google Signup
googleSignupBtn?.addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      name: user.displayName || "User",
      role: "user"
    });

    showToast("✅ Google Sign Up successful! Redirecting...");
    setTimeout(() => window.location.href = "dashboard.html", 1000);
  } catch (err) {
    showToast("Google signup failed: " + err.message, false);
  }
});

// ✅ Go to Login
goToLoginBtn?.addEventListener("click", () => {
  window.location.href = "login.html";
});

// ✅ Cooldown Timer
function startCooldown() {
  cooldown = true;
  let timer = 30;
  resendBtn.textContent = `Wait ${timer}s`;
  resendBtn.disabled = true;
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
