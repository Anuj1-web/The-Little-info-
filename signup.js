// signup.js
import { auth } from './firebase.js';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

const signupForm = document.getElementById('signupForm');
const messageBox = document.getElementById('message');
const resendBtn = document.getElementById('resendVerification');

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await sendEmailVerification(user);

    messageBox.innerHTML = `
      ✅ Signup successful! A verification email has been sent to <strong>${email}</strong>.
      Please verify your email before logging in.
    `;
    resendBtn.style.display = 'block';

    // Optional: Sign out the user immediately to force verification on login
    await signOut(auth);
  } catch (error) {
    messageBox.innerHTML = `❌ Error: ${error.message}`;
    console.error(error);
  }
});

resendBtn.addEventListener('click', async () => {
  const user = auth.currentUser;

  if (user) {
    await sendEmailVerification(user);
    messageBox.innerHTML = `📨 Verification email re-sent to <strong>${user.email}</strong>.`;
  } else {
    messageBox.innerHTML = `❌ Please sign up again or log in to resend verification.`;
  }
});
