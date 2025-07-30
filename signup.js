// signup.js
import { auth } from './firebase.js';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Send email verification
    await sendEmailVerification(user);
    alert('Signup successful! Please verify your email before logging in.');

    // Optional redirect
    window.location.href = 'login.html';
  } catch (error) {
    console.error('Signup error:', error);
    alert(error.message || 'Signup failed. Please try again.');
  }
});
