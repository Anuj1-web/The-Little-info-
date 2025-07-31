import { auth, db } from './firebaseInit.js';
import {
  updateEmail,
  updatePassword,
  deleteUser,
  onAuthStateChanged,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import {
  doc,
  getDoc,
  updateDoc
} from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

// Elements
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const updateEmailBtn = document.getElementById('updateEmailBtn');
const updatePasswordBtn = document.getElementById('updatePasswordBtn');
const deleteAccountBtn = document.getElementById('deleteAccountBtn');
const twoStepToggle = document.getElementById('twoStepToggle');
const userRoleSpan = document.getElementById('userRole');
const toastBox = document.getElementById('toastBox');

// Current user
let currentUser;

// Show toast
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastBox.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// Load user info
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  currentUser = user;
  emailInput.value = user.email;

  // Load user role from Firestore
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const userData = userSnap.data();
    userRoleSpan.textContent = userData.role || 'user';

    if (userData.role !== 'admin') {
      document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    }

    twoStepToggle.checked = !!userData.twoStepAuth;
  } else {
    showToast('User data not found in Firestore.', 'error');
  }
});

// Validate email
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Update email
updateEmailBtn.addEventListener('click', async () => {
  const newEmail = emailInput.value.trim();
  if (!isValidEmail(newEmail)) {
    showToast('Invalid email format.', 'error');
    return;
  }

  try {
    const credential = EmailAuthProvider.credential(currentUser.email, prompt("Enter current password to reauthenticate:"));
    await reauthenticateWithCredential(currentUser, credential);
    await updateEmail(currentUser, newEmail);
    showToast('Email updated successfully.');

    // Update Firestore too
    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, { email: newEmail });

  } catch (err) {
    showToast('Failed to update email: ' + err.message, 'error');
  }
});

// Update password
updatePasswordBtn.addEventListener('click', async () => {
  const newPass = passwordInput.value.trim();
  if (newPass.length < 6) {
    showToast('Password must be at least 6 characters.', 'error');
    return;
  }

  try {
    const credential = EmailAuthProvider.credential(currentUser.email, prompt("Enter current password to reauthenticate:"));
    await reauthenticateWithCredential(currentUser, credential);
    await updatePassword(currentUser, newPass);
    showToast('Password updated successfully.');
  } catch (err) {
    showToast('Failed to update password: ' + err.message, 'error');
  }
});

// Delete account
deleteAccountBtn.addEventListener('click', async () => {
  if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;

  try {
    const credential = EmailAuthProvider.credential(currentUser.email, prompt("Enter current password to reauthenticate:"));
    await reauthenticateWithCredential(currentUser, credential);
    await deleteUser(currentUser);
    showToast('Account deleted.');
    setTimeout(() => {
      window.location.href = 'signup.html';
    }, 3000);
  } catch (err) {
    showToast('Failed to delete account: ' + err.message, 'error');
  }
});

// Toggle Two-Step Auth
twoStepToggle.addEventListener('change', async () => {
  try {
    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, { twoStepAuth: twoStepToggle.checked });
    showToast(`Two-step authentication ${twoStepToggle.checked ? 'enabled' : 'disabled'}.`);
  } catch (err) {
    showToast('Error updating two-step setting: ' + err.message, 'error');
  }
});
