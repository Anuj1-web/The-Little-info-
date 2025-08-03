import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const auth = getAuth();
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const signupBtn = document.getElementById('signupBtn');
const sendVerificationBtn = document.getElementById('sendVerificationBtn');
const messageBox = document.getElementById('signupMessage');

signupBtn.addEventListener('click', async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const confirmPassword = confirmPasswordInput.value.trim();

  if (!email || !password || !confirmPassword) {
    return showMessage('Please fill in all fields.');
  }

  if (password.length < 6) {
    return showMessage('Password must be at least 6 characters.');
  }

  if (password !== confirmPassword) {
    return showMessage('Passwords do not match.');
  }

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCred.user);
    showMessage('✅ Account created. Please verify your email to log in.');
    sendVerificationBtn.style.display = 'inline-block';

    // Start checking if user verified email every 10 seconds for 3 minutes
    let elapsed = 0;
    const interval = setInterval(async () => {
      await userCred.user.reload();
      if (userCred.user.emailVerified) {
        clearInterval(interval);
        showMessage('✅ Email verified! You can now log in.');
        setTimeout(() => window.location.href = 'login.html', 2000);
      }
      elapsed += 10;
      if (elapsed >= 180) {
        clearInterval(interval);
        showMessage('⏰ Link expired or email not verified. Please try again.');
      }
    }, 10000);
  } catch (err) {
    showMessage(`❌ ${err.message}`);
  }
});

sendVerificationBtn.addEventListener('click', async () => {
  const user = auth.currentUser;
  if (user && !user.emailVerified) {
    try {
      await sendEmailVerification(user);
      showMessage('📩 Verification link sent again. Please check your inbox.');
    } catch (err) {
      showMessage(`❌ ${err.message}`);
    }
  }
});

function showMessage(msg) {
  messageBox.textContent = msg;
  messageBox.style.opacity = '1';
}
