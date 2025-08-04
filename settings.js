import {
  getAuth,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  deleteUser,
  sendEmailVerification,
  signOut,
  reauthenticateWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider
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

const nameInput = document.getElementById('usernameInput');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('newPasswordInput');
const roleDisplay = document.getElementById('roleDisplay');
const twoStepToggle = document.getElementById('twoStepToggle');
const deleteBtn = document.getElementById('deleteAccountBtn');
const updateBtn = document.getElementById('updateProfileBtn');
const verifyBtn = document.getElementById('verifyEmailBtn');

// Auth State Listener
onAuthStateChanged(auth, async (user) => {
  if (!user) return window.location.href = "login.html";
  currentUser = user;

  const userDoc = await getDoc(doc(db, "users", user.uid));
  const data = userDoc.data();

  nameInput.value = data.username || "";
  emailInput.value = user.email || "";
  roleDisplay.textContent = "Role: " + (data.role || "user");
  isAdmin = data.role === "admin";
  twoStepToggle.checked = data.twoStep || false;

  if (!user.emailVerified) {
    updateBtn.disabled = true;
    updateBtn.title = "Please verify your email to enable updating.";
  }

  // Disable update/delete for OAuth
  if (user.providerData.some(p => p.providerId !== 'password')) {
    passwordInput.disabled = true;
    verifyBtn.style.display = 'none';
    showToast("OAuth login detected – password changes disabled.", "info");
  }

  if (!isAdmin) {
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
  }
});

// Email Verification
verifyBtn.addEventListener('click', () => {
  if (!currentUser.emailVerified) {
    sendEmailVerification(currentUser)
      .then(() => showToast("Verification email sent!", "success"))
      .catch(err => showToast("Error: " + err.message, "error"));
  } else {
    showToast("Email already verified.", "info");
  }
});

// Update Profile
updateBtn.addEventListener('click', () => {
  if (!validateInputs()) return;

  if (!currentUser.emailVerified && currentUser.providerData[0].providerId === 'password') {
    return showToast("Please verify your email before updating.", "error");
  }

  showModal("Confirm profile update?", async () => {
    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        username: nameInput.value,
        twoStep: twoStepToggle.checked,
      });

      await updateProfile(currentUser, {
        displayName: nameInput.value,
      });

      if (passwordInput.value) {
        await updatePassword(currentUser, passwordInput.value);
      }

      showToast("Profile updated!", "success");
      closeModal();
    } catch (err) {
      showToast("Update failed: " + err.message, "error");
    }
  });
});

// Delete Account
deleteBtn.addEventListener('click', () => {
  if (!currentUser.emailVerified) {
    return showToast("Verify email before deleting account.", "error");
  }

  showModal("Are you sure you want to delete your account?", async () => {
    try {
      await deleteUser(currentUser);
      showToast("Account deleted.", "success");
      window.location.href = "signup.html";
    } catch (err) {
      showToast("Delete failed: " + err.message, "error");
    }
  });
});

// Input Validation
function validateInputs() {
  const username = nameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username) {
    showToast("Username is required.", "error");
    return false;
  }

  if (password && password.length < 6) {
    showToast("Password must be at least 6 characters.", "error");
    return false;
  }

  return true;
}
