// ✅ signup.js (updated for Firestore user profile creation)

import { auth, db } from './firebaseInit.js';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import {
  doc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const signupForm = document.getElementById("signupForm");
const signupStatus = document.getElementById("signupStatus");

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const name = document.getElementById("name").value.trim();

  if (!email || !password || !name) {
    signupStatus.textContent = "All fields are required.";
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // ✅ Store user profile in Firestore
    await setDoc(doc(db, "users", user.uid), {
      name: name,
      email: user.email,
      photoURL: user.photoURL || "",
      createdAt: serverTimestamp(),
    });

    // ✅ Send verification email
    await sendEmailVerification(user);

    signupStatus.textContent = "Verification link sent! Check your email.";
    signupForm.reset();
  } catch (error) {
    signupStatus.textContent = "Signup failed: " + error.message;
  }
});
