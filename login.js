// login.js
import { auth } from './firebase.js';
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert('Login successful!');
    // Redirect or load next content
    window.location.href = 'dashboard.html'; // Change this to your landing page
  } catch (error) {
    console.error('Login error:', error);
    alert(error.message || 'Login failed. Please check your credentials.');
  }
});
