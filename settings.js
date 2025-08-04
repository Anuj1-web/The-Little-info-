// SETTINGS.JS
import { auth, db } from './firebase.js';
import {
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
} from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { showToast } from './toast.js';

const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const newPasswordInput = document.getElementById('new-password');
const roleInput = document.getElementById('role');
const updateBtn = document.getElementById('updateBtn');
const deleteBtn = document.getElementById('deleteBtn');
const confirmModal = document.getElementById('confirmModal');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmPassword = document.getElementById('confirmPassword');
const twoStepToggle = document.getElementById('twoStepToggle');

let currentUser;

window.addEventListener('DOMContentLoaded', async () => {
  currentUser = auth.currentUser;
  if (!currentUser) return;

  const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
  if (userDoc.exists()) {
    const userData = userDoc.data();
    usernameInput.value = userData.username || '';
    emailInput.value = currentUser.email;
    roleInput.value = userData.role || 'user';
    twoStepToggle.checked = userData.twoStep || false;
  }
});

updateBtn.addEventListener('click', async () => {
  const newUsername = usernameInput.value.trim();
  const newPassword = newPasswordInput.value.trim();

  const email = currentUser.email;
  const password = prompt(`Please enter your current password for ${email}`);
  if (!password) return showToast('Verification cancelled.', 'error');

  try {
    const credential = EmailAuthProvider.credential(email, password);
    await reauthenticateWithCredential(currentUser, credential);

    if (newUsername) await updateDoc(doc(db, 'users', currentUser.uid), { username: newUsername });
    if (newPassword) await updatePassword(currentUser, newPassword);

    await updateDoc(doc(db, 'users', currentUser.uid), {
      twoStep: twoStepToggle.checked,
    });

    showToast('Profile updated successfully!', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
});

deleteBtn.addEventListener('click', () => {
  confirmModal.classList.add('show');
});

cancelDeleteBtn.addEventListener('click', () => {
  confirmModal.classList.remove('show');
});

confirmDeleteBtn.addEventListener('click', async () => {
  const password = confirmPassword.value.trim();
  if (!password) return showToast('Please enter your password.', 'error');

  try {
    const credential = EmailAuthProvider.credential(currentUser.email, password);
    await reauthenticateWithCredential(currentUser, credential);
    await deleteUser(currentUser);
    showToast('Account deleted.', 'success');
    window.location.href = 'signup.html';
  } catch (err) {
    showToast(err.message, 'error');
  }
});
