// settings.js - Final Version with Email Verification Check and Disabled Update Until Verified

import {
  getAuth,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  deleteUser,
  sendEmailVerification,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { app } from './firebase-config.js';
import { showToast, showModal, closeModal } from './ui-utils.js';

const auth = getAuth(app);
const db = getFirestore(app);

let currentUser;
let isAdmin = false;

const form = document.getElementById('settingsForm');
const nameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('new-password');
const roleDisplay = document.getElementById('role');
const twoStepToggle = document.getElementById('twoStepToggle');
const deleteBtn = document.getElementById('deleteAccountBtn');
const updateBtn = document.getElementById('updateProfileBtn');
const verifyBtn = document.getElementById('verifyEmailBtn');

onAuthStateChanged(auth, async (user) => {
  if (!user) return window.location.href = "/login.html";
  currentUser = user;

  const userDoc = await getDoc(doc(db, "users", user.uid));
  const data = userDoc.data();

  nameInput.value = data.username || "";
  emailInput.value = user.email || "";
  emailInput.readOnly = true;
  roleDisplay.textContent = data.role || "user";
  isAdmin = data.role === "admin";
  twoStepToggle.checked = data.twoStep || false;

  if (user.providerData.some(p => p.providerId !== 'password')) {
    emailInput.disabled = true;
    passwordInput.disabled = true;
    verifyBtn.style.display = 'none';
    showToast("OAuth account detected — email/password changes disabled.", "info");
  }

  if (!user.emailVerified) {
    updateBtn.disabled = true;
    updateBtn.title = "Please verify your email to enable this option.";
  }

  if (!isAdmin) {
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
  }
});

verifyBtn.addEventListener('click', () => {
  if (!currentUser.emailVerified) {
    sendEmailVerification(currentUser)
      .then(() => showToast("Verification email sent.", "success"))
      .catch(err => showToast("Error sending verification: " + err.message, "error"));
  } else {
    showToast("Email is already verified.", "info");
  }
});

function validateForm() {
  const username = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !email) {
    showToast("Username and email are required.", "error");
    return false;
  }
  if (password && password.length < 6) {
    showToast("Password must be at least 6 characters.", "error");
    return false;
  }
  return true;
}

updateBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  if (!currentUser.emailVerified && currentUser.providerData[0].providerId === 'password') {
    showToast("Please verify your email before updating.", "error");
    return;
  }

  showModal("Are you sure you want to update your profile?", async () => {
    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        username: nameInput.value,
        twoStep: twoStepToggle.checked,
      });

      await updateProfile(currentUser, { displayName: nameInput.value });

      if (passwordInput.value) {
        await updatePassword(currentUser, passwordInput.value);
      }

      showToast("Profile updated successfully!", "success");
      closeModal();
    } catch (error) {
      showToast("Update failed: " + error.message, "error");
    }
  });
});

deleteBtn.addEventListener('click', () => {
  showModal("Are you sure you want to delete your account?", async () => {
    try {
      await deleteUser(currentUser);
      showToast("Account deleted.", "success");
      window.location.href = "/signup.html";
    } catch (error) {
      showToast("Error deleting account: " + error.message, "error");
    }
  });
});
