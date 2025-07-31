// reset-password.js
import { auth } from './firebase.js';
import { sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

const resetForm = document.getElementById('resetForm');

resetForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('resetEmail').value.trim();

  try {
    await sendPasswordResetEmail(auth, email);
    alert(`✅ Reset link sent to ${email}. Check your inbox.`);
    resetForm.reset();
  } catch (error) {
    alert(`❌ ${error.message}`);
    console.error(error);
  }
});
