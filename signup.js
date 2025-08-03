import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCpoq_sjH_XLdJ1ZRc0ECFaglvXh3FIS5Q",
  authDomain: "the-little-info.firebaseapp.com",
  projectId: "the-little-info",
  storageBucket: "the-little-info.appspot.com",
  messagingSenderId: "165711417682",
  appId: "1:165711417682:web:cebb205d7d5c1f18802a8b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Toast function
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// Handle Sign Up
document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const emailVal = document.getElementById("email").value.trim();
  const passVal = document.getElementById("password").value.trim();
  const nameVal = document.getElementById("name").value.trim();

  if (!emailVal || !passVal || !nameVal) {
    showToast("Please fill in all fields", "error");
    return;
  }

  try {
    const userCred = await createUserWithEmailAndPassword(auth, emailVal, passVal);
    await sendEmailVerification(userCred.user);

    showToast("Account created! Verification email sent.", "success");

    // Show Resend button
    document.getElementById("resendBtnContainer").style.display = "block";

    // Resend handler
    const resendBtn = document.getElementById("resendBtn");
    resendBtn.onclick = async () => {
      resendBtn.disabled = true;
      resendBtn.textContent = "Sending...";
      try {
        await sendEmailVerification(userCred.user);
        showToast("Verification email resent.", "success");
      } catch (err) {
        showToast("Failed to resend verification email.", "error");
      }
      setTimeout(() => {
        resendBtn.disabled = false;
        resendBtn.textContent = "Resend Verification Email";
      }, 30000); // 30 seconds cooldown
    };

    // Check verification for 3 minutes
    const interval = setInterval(async () => {
      await userCred.user.reload();
      const refreshedUser = auth.currentUser;

      if (refreshedUser.emailVerified) {
        clearInterval(interval);
        showToast("Email verified! Redirecting...", "success");
        setTimeout(() => {
          window.location.href = "login.html";
        }, 1500);
      }
    }, 10000);

    // Auto signout after 3 minutes
    setTimeout(() => {
      clearInterval(interval);
      signOut(auth);
      showToast("Verification timeout. Please try again.", "error");
    }, 180000);

  } catch (err) {
    showToast(err.message, "error");
  }
});
