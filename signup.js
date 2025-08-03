import { getAuth, createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { app } from "./firebase.js";

const auth = getAuth(app);

// Elements
const signupForm = document.getElementById("signupForm");
const resendBtn = document.getElementById("resendBtn");
const resendSection = document.getElementById("resendSection");
const toastContainer = document.getElementById("toastContainer");

// Toast function
function showToast(message, isError = false) {
  const toast = document.createElement("div");
  toast.className = `toast ${isError ? "error" : "success"}`;
  toast.innerText = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// Handle Signup
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;

  if (name.length < 3) {
    showToast("Full name must be at least 3 characters", true);
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: name });
    await sendEmailVerification(user);

    showToast("Verification email sent. Please check your inbox.");

    // Show resend section
    resendSection.classList.remove("hidden");
    resendBtn.disabled = true;
    resendBtn.innerText = "Resend in 30s";

    // Countdown to enable resend
    let countdown = 30;
    const interval = setInterval(() => {
      countdown--;
      resendBtn.innerText = `Resend in ${countdown}s`;
      if (countdown <= 0) {
        clearInterval(interval);
        resendBtn.disabled = false;
        resendBtn.innerText = "Resend Verification Email";
      }
    }, 1000);
  } catch (error) {
    const msg = error.message.includes("email-already-in-use")
      ? "Email already in use. Try logging in."
      : "Signup failed. Please try again.";
    showToast(msg, true);
  }
});

// Resend email logic
resendBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (user) {
    try {
      await sendEmailVerification(user);
      showToast("Verification email resent.");
      resendBtn.disabled = true;
      resendBtn.innerText = "Resend in 30s";

      // Repeat countdown
      let countdown = 30;
      const interval = setInterval(() => {
        countdown--;
        resendBtn.innerText = `Resend in ${countdown}s`;
        if (countdown <= 0) {
          clearInterval(interval);
          resendBtn.disabled = false;
          resendBtn.innerText = "Resend Verification Email";
        }
      }, 1000);
    } catch {
      showToast("Could not resend email. Try again.", true);
    }
  }
});
