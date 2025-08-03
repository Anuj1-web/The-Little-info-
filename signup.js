// signup.js
import { auth } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";

// Wait for DOM to load
document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signup-form");

  if (!signupForm) {
    console.error("Signup form not found. Make sure your form has id='signup-form'");
    return;
  }

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get form values
    const email = document.getElementById("signup-email")?.value.trim();
    const password = document.getElementById("signup-password")?.value.trim();
    const username = document.getElementById("signup-username")?.value.trim();

    if (!email || !password || !username) {
      showToast("Please fill in all fields", true);
      return;
    }

    try {
      // Create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update display name
      await updateProfile(user, { displayName: username });

      // Send verification email
      await sendEmailVerification(user);

      showToast("Signup successful! Please verify your email.", false);
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);
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
          message = "Password must be at least 6 characters.";
          break;
        default:
          message = error.message;
      }
      console.error("Signup Error:", error);
      showToast(message, true);
    }
  });
});

// ✅ Toast Function
function showToast(message, isError = false) {
  const toastContainer = document.getElementById("toastContainer");
  if (!toastContainer) return;

  const toast = document.createElement("div");
  toast.className = "toast" + (isError ? " error" : " success");
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}
