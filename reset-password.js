// reset-password.js
import { auth } from './firebase.js'; // assumes firebase.js exports configured auth instance

document.getElementById('resetForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('resetEmail').value.trim();

  if (!email) {
    alert('Please enter your email.');
    return;
  }

  try {
    await auth.sendPasswordResetEmail(email);
    alert('Password reset email sent. Please check your inbox.');
    document.getElementById('resetForm').reset();
  } catch (error) {
    console.error('Error sending password reset email:', error);
    alert(error.message || 'Something went wrong. Please try again.');
  }
});
