import { auth, db } from './firebase.js';
import { updateProfile, updateEmail, deleteUser, sendEmailVerification } from 'firebase/auth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

const settingsForm = document.getElementById('settingsForm');
const deleteBtn = document.getElementById('deleteAccount');
const confirmModal = document.getElementById('confirmModal');
const cancelDelete = document.getElementById('cancelDelete');
const confirmDelete = document.getElementById('confirmDelete');
const verifyEmailBtn = document.getElementById('verifyEmail');

window.addEventListener('DOMContentLoaded', async () => {
  const user = auth.currentUser;
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  document.getElementById('username').value = user.displayName || '';
  document.getElementById('email').value = user.email || '';
  document.getElementById('role').value = (await getDoc(doc(db, 'users', user.uid))).data().role || 'user';
});

settingsForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return;

  const newUsername = document.getElementById('username').value;
  const newEmail = document.getElementById('email').value;
  const newPassword = document.getElementById('newPassword').value;
  const enable2FA = document.getElementById('enable2FA').checked;

  try {
    if (newUsername !== user.displayName) {
      await updateProfile(user, { displayName: newUsername });
    }

    if (newEmail !== user.email) {
      await updateEmail(user, newEmail);
    }

    if (newPassword.length >= 6) {
      await user.updatePassword(newPassword);
    }

    await updateDoc(doc(db, 'users', user.uid), {
      displayName: newUsername,
      email: newEmail,
      twoFactorEnabled: enable2FA,
    });

    alert('Settings updated successfully!');
  } catch (error) {
    alert('Error updating settings: ' + error.message);
  }
});

deleteBtn.addEventListener('click', () => {
  confirmModal.classList.remove('hidden');
});

cancelDelete.addEventListener('click', () => {
  confirmModal.classList.add('hidden');
});

confirmDelete.addEventListener('click', async () => {
  const user = auth.currentUser;
  try {
    await deleteUser(user);
    alert('Account deleted.');
    window.location.href = 'signup.html';
  } catch (error) {
    alert('Error deleting account: ' + error.message);
  }
});

verifyEmailBtn.addEventListener('click', async () => {
  const user = auth.currentUser;
  try {
    await sendEmailVerification(user);
    alert('Verification email sent.');
  } catch (error) {
    alert('Error sending verification: ' + error.message);
  }
});
