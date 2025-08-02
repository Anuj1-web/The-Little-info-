import { auth } from './firebase.js';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  deleteUser
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

// Signup form submit
document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value.trim();

  if (!email || !password) {
    showToast('Please fill all fields.', false);
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await sendEmailVerification(user);
    showToast('Signup successful. Verification email sent. Please verify before login.', true);
    document.getElementById('signupForm').reset();
  } catch (error) {
    showToast(error.message, false);
  }
});

// Email verification button logic
document.getElementById('sendVerificationBtn').addEventListener('click', async () => {
  const email = document.getElementById('verifyEmail').value.trim();
  const password = 'TempPass123@'; // temporary password

  if (!email) {
    showVerifyStatus('Please enter an email first.', false);
    return;
  }

  try {
    const tempCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(tempCredential.user);
    showVerifyStatus('Verification email sent. Check your inbox.', true);

    // Immediately delete temp user to prevent conflicts
    await deleteUser(tempCredential.user);
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      showVerifyStatus('Email already registered. Try logging in.', false);
    } else {
      showVerifyStatus(err.message, false);
    }
  }
});

// Toast for signup result
function showToast(message, success = true) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.className = `toast ${success ? 'toast-success' : 'toast-error'}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// Email verify inline status
function showVerifyStatus(message, success) {
  const status = document.getElementById('verifyStatus');
  status.textContent = message;
  status.style.color = success ? 'lightgreen' : 'salmon';
}
