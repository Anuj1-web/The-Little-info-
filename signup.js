// signup.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
const db = getFirestore(app);

const signupForm = document.getElementById("signupForm");
const resendBtn = document.getElementById("resendBtn");
let currentUser = null;

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("emailInput").value.trim();
  const password = document.getElementById("passwordInput").value.trim();
  const username = document.getElementById("usernameInput").value.trim();

  if (!email || !password || !username) {
    showToast("All fields are required", "error");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    currentUser = user;

    // 🔥 Create Firestore user doc (FIX FOR LOGIN ISSUE)
    await setDoc(doc(db, "users", user.uid), {
      email: email,
      username: username,
      createdAt: Date.now(),
      role: "user",
      twoStepEnabled: false
    });

    await sendEmailVerification(user);
    showToast("Verification email sent ✔️");
    resendBtn.style.display = "inline-block";

    setTimeout(() => {
      signOut(auth);
      showToast("Signed out. Verify your email and login.");
    }, 3000);
  } catch (error) {
    showToast(error.message, "error");
  }
});

resendBtn.addEventListener("click", async () => {
  if (!currentUser) {
    showToast("No user to resend to", "error");
    return;
  }
  try {
    await sendEmailVerification(currentUser);
    showToast("Verification link resent");
  } catch (err) {
    showToast("Error resending email", "error");
  }
});
