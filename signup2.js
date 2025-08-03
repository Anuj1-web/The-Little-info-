// signup2.js
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { app } from "./firebase-config.js"; // Make sure this file is correct and in the same folder

const auth = getAuth(app);
const form = document.getElementById("signupForm2");
const toast = document.getElementById("toastContainer");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!name || !email || !password) {
    showToast("All fields are required.", false);
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);
    showToast(`Account created. Verification email sent to ${email}`, true);
    form.reset();
  } catch (error) {
    showToast(error.message, false);
  }
});

function showToast(msg, success) {
  toast.innerHTML = `<div class="toast ${success ? 'success' : 'error'}">${msg}</div>`;
  setTimeout(() => {
    toast.innerHTML = "";
  }, 3000);
}
