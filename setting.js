// setting.js
import { auth, db } from './firebaseInit.js';
import {
  onAuthStateChanged,
  updatePassword,
  signOut
} from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import {
  doc,
  getDoc,
  updateDoc
} from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

// DOM references
const emailDisplay = document.getElementById('userEmail');
const passwordForm = document.getElementById('passwordForm');
const themeToggle = document.getElementById('themeToggle');

// Display user info
onAuthStateChanged(auth, async (user) => {
  if (user) {
    emailDisplay.textContent = user.email;

    // Optionally load user settings from Firestore
    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const settings = docSnap.data();
      // Set UI based on settings if needed
    }
  } else {
    alert('Please log in to access settings.');
    window.location.href = 'login.html';
  }
});

// Handle password change
passwordForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const newPassword = document.getElementById('newPassword').value.trim();

  if (newPassword.length < 6) {
    alert('Password should be at least 6 characters.');
    return;
  }

  try {
    const user = auth.currentUser;
    await updatePassword(user, newPassword);
    alert('Password updated successfully.');
    passwordForm.reset();
  } catch (error) {
    console.error('Error updating password:', error);
    alert('Failed to update password. Please try again.');
  }
});

// Logout logic
document.getElementById('logoutBtn').addEventListener('click', async () => {
  await signOut(auth);
  window.location.href = 'login.html';
});

// Theme toggle logic
themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
});

// Load stored theme
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
});
