// signup.js
import { auth } from './firebaseInit.js';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

const signupForm = document.getElementById("signupForm");
const message = document.getElementById("signupMessage");

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value.trim();

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // ✅ Send email verification
    await sendEmailVerification(user);
    message.textContent = "Signup successful! Please check your email to verify your account.";
    signupForm.reset();
  } catch (error) {
    message.textContent = "Signup failed: " + error.message;
  }
});
