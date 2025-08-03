// signup.js
import { auth } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";

document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signup-form");
  const resendBtn = document.getElementById("resendBtn");
  const resendSection = document.getElementById("resendSection");
  const toastContainer = document.getElementById("toastContainer");

  if (!signupForm) {
    console.error("Signup form not found.");
    return;
  }

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value.trim();
    const username = document.getElementById("signup-username")?.value.trim();

    if (!email || !password) {
      showToast("Please fill in all required fields.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (username) {
        await updateProfile(user, { displayName: username });
      }

      await sendEmailVerification(user);
      showToast("Verification email sent. Please check your inbox.", "success");

      resendSection.classList.remove("hidden");
    } catch (error) {
      let message = "Signup failed.";
      switch (error.code) {
        case "auth/email-already-in-use":
          message = "This email is already registered.";
          break;
        case "auth/invalid-email":
          message = "Invalid email address.";
          break;
        case "auth/weak-password":
          message = "Password should be at least 6 characters.";
          break;
        default:
          message = error.message;
      }
      showToast(message, "error");
    }
  });

  if (resendBtn) {
    resendBtn.addEventListener("click", async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          await sendEmailVerification(user);
          showToast("Verification email resent.");
        } catch (error) {
          showToast("Failed to resend verification email.", "error");
        }
      }
    });
  }

  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
  }
});
