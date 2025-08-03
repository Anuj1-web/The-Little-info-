// signup.js

import { auth, db } from './firebase.js';
import {
  createUserWithEmailAndPassword,
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import {
  collection, doc, setDoc
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

const sendOtpBtn = document.getElementById('sendOtpBtn');
const verifyEmailInput = document.getElementById('verifyEmail');
const otpInput = document.getElementById('otpInput');
const verifyStatus = document.getElementById('verifyStatus');
const signupForm = document.getElementById('signupForm');
const finalEmailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');

let generatedOTP = '';
let otpExpiry = null;
let verifiedEmail = '';

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

sendOtpBtn.addEventListener('click', async () => {
  const email = verifyEmailInput.value.trim();
  if (!email || !email.includes('@')) {
    verifyStatus.style.color = 'red';
    verifyStatus.textContent = 'Please enter a valid email address.';
    return;
  }

  generatedOTP = generateOTP();
  otpExpiry = Date.now() + 3 * 60 * 1000;

  try {
    await setDoc(doc(collection(db, 'emailOtps'), email), {
      otp: generatedOTP,
      createdAt: Date.now()
    });

    verifyStatus.style.color = 'green';
    verifyStatus.textContent = `OTP sent to ${email}. Valid for 3 minutes.`;

  } catch (error) {
    console.error('Error sending OTP:', error);
    verifyStatus.style.color = 'red';
    verifyStatus.textContent = 'Failed to send OTP. Try again later.';
  }
});

otpInput.addEventListener('input', () => {
  const enteredOTP = otpInput.value.trim();
  if (enteredOTP === generatedOTP && Date.now() <= otpExpiry) {
    verifiedEmail = verifyEmailInput.value.trim();
    finalEmailInput.value = verifiedEmail;
    verifyStatus.style.color = 'green';
    verifyStatus.textContent = '✅ Email verified!';
    finalEmailInput.readOnly = true;
  } else if (Date.now() > otpExpiry) {
    verifyStatus.style.color = 'red';
    verifyStatus.textContent = '❌ OTP expired. Please resend.';
  }
});

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = finalEmailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (!verifiedEmail || email !== verifiedEmail) {
    alert('Email not verified. Please verify via OTP first.');
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
    await createUserWithEmailAndPassword(auth, email, password);
    alert('Signup successful!');
    window.location.href = 'dashboard.html';
  } catch (err) {
    console.error('Signup error:', err.message);
    alert('Signup failed: ' + err.message);
  }
});
