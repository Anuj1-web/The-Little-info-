// signup.js
import { auth } from "./firebase.js";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

// Wait for DOM to load
document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signup-form");

  if (!signupForm) {
    console.error("Signup form not found. Make sure your form has id='signup-form'");
    return;
  }

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Extract form fields
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value.trim();
    const username = document.getElementById("signup-username")?.value.trim(); // Optional username field

    // Basic validation
    if (!email || !password) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      // Create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Optional: update profile with display name
      if (username) {
        await updateProfile(user, { displayName: username });
      }

      alert("Signup successful! Welcome, " + (username || user.email));
      window.location.href = "index.html"; // Redirect to homepage or dashboard
    } catch (error) {
      // Handle errors with meaningful messages
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
      console.error("Signup Error:", error);
      alert(message);
    }
  });
});
