// Firebase setup (make sure firebase is initialized in your project)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCpoq_sjH_XLdJ1ZRc0ECFaglvXh3FIS5Q",
  authDomain: "the-little-info.firebaseapp.com",
  projectId: "the-little-info",
  storageBucket: "the-little-info.firebasestorage.app",
  messagingSenderId: "165711417682",
  appId: "1:165711417682:web:cebb205d7d5c1f18802a8b"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Toast function (already built into your site)
function toast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerText = message;
  document.getElementById("toastContainer").appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
}

// Elements
const signupForm = document.getElementById("signupForm");
const resendBtn = document.getElementById("resendVerificationBtn");

let verificationInterval = null;

// Signup form submission
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;

  if (!name || !email || password.length < 6) {
    toast("Please fill all fields correctly.", "error");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save user profile in Firestore
    await setDoc(doc(db, "users", user.uid), {
      name,
      email,
      createdAt: new Date(),
      role: "user",
      twoStepAuth: false,
    });

    // Send verification email
    await sendEmailVerification(user);
    toast("Verification email sent. Please check your inbox.", "success");

    resendBtn.style.display = "none";
    clearInterval(verificationInterval);
    startResendTimer();

    // Monitor if user verifies
    monitorVerification();
  } catch (error) {
    toast(error.message, "error");
  }
});

// Resend email
resendBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (user && !user.emailVerified) {
    try {
      await sendEmailVerification(user);
      toast("Verification email resent.", "success");
      resendBtn.style.display = "none";
      startResendTimer();
    } catch (error) {
      toast("Failed to resend email. Try again later.", "error");
    }
  }
});

// 30 sec resend delay
function startResendTimer() {
  let seconds = 30;
  verificationInterval = setInterval(() => {
    seconds--;
    if (seconds <= 0) {
      clearInterval(verificationInterval);
      resendBtn.style.display = "inline-block";
    }
  }, 1000);
}

// Check if user verified their email
function monitorVerification() {
  const interval = setInterval(async () => {
    const user = auth.currentUser;
    if (!user) return;
    await user.reload();
    if (user.emailVerified) {
      clearInterval(interval);
      toast("Email verified successfully!", "success");
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 2000);
    }
  }, 3000);
}
