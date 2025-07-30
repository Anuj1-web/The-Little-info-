// login.js
import { auth } from './firebase.js';
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Optional: Admin check (if using custom claims in future)
    if (user.email === "thelittleinfo01@gmail.com") {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'index.html';
    }
  } catch (error) {
    alert("Login failed: " + error.message);
  }
});
