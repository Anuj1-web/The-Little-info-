import { auth, db } from './firebase.js';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

const signupForm = document.getElementById('signupForm');
const verifyBox = document.getElementById('verifyBox');
const verifyStatus = document.getElementById('verifyStatus');

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

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

    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      uid: user.uid,
      createdAt: new Date()
    });

    await sendEmailVerification(user);
    verifyStatus.innerHTML = `📩 A verification link has been sent to <b>${email}</b>. Please verify within 3 minutes.`;
    verifyBox.style.display = 'block';

    // Check every 10 seconds for 3 minutes
    const checkInterval = 10000; // 10 sec
    const timeout = 180000; // 3 min
    const startTime = Date.now();

    const intervalId = setInterval(async () => {
      await user.reload();

      if (user.emailVerified) {
        clearInterval(intervalId);
        verifyStatus.innerHTML = "✅ Email verified successfully. Redirecting...";
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1500);
      } else if (Date.now() - startTime > timeout) {
        clearInterval(intervalId);
        alert('Email not verified in time. You are now signed out.');
        await signOut(auth);
        location.reload();
      }
    }, checkInterval);

  } catch (err) {
    console.error('Signup error:', err.message);
    alert('Signup failed: ' + err.message);
  }
});
