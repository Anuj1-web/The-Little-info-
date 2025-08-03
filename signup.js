import { auth } from './firebase.js';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

const signupForm = document.getElementById('signupForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (!email || !email.includes('@')) {
    alert('Please enter a valid email address.');
    return;
  }

  if (password.length < 6) {
    alert('Password must be at least 6 characters.');
    return;
  }

  if (password !== confirmPassword) {
    alert('Passwords do not match.');
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await sendEmailVerification(user);

    alert('A verification email has been sent to your email. Please verify before logging in.');

    await signOut(auth); // Force user to logout until they verify

    window.location.href = 'login.html';
  } catch (error) {
    console.error('Signup error:', error);
    alert('Signup failed: ' + error.message);
  }
});
