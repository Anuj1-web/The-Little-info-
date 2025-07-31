// user-data.js
import { auth } from './firebase.js';
import {
  onAuthStateChanged,
  signOut,
  sendEmailVerification
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

const db = getFirestore();

// DOM references
const userProfile = document.getElementById('userProfile');
const logoutBtn = document.getElementById('logoutBtn');
const emailStatus = document.getElementById('emailStatus');
const bookmarksList = document.getElementById('bookmarksList');
const commentsList = document.getElementById('commentsList');
const likedContent = document.getElementById('likedContent');
const resendLinkBtn = document.getElementById('resendVerification');

// Auth state handling
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const { displayName, email, uid, emailVerified, photoURL, metadata } = user;

    userProfile.innerHTML = `
      <h2>Hello, ${displayName || 'User'}!</h2>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>UID:</strong> ${uid}</p>
      <p><strong>Email Verified:</strong> ${emailVerified ? '✅' : '❌ Not verified'}</p>
      <p><strong>Account Created:</strong> ${new Date(metadata.creationTime).toLocaleString()}</p>
      <p><strong>Last Login:</strong> ${new Date(metadata.lastSignInTime).toLocaleString()}</p>
      ${photoURL ? `<img src="${photoURL}" alt="Profile Picture" style="max-width:100px; border-radius:50%;">` : ''}
    `;

    if (!emailVerified && resendLinkBtn) {
      resendLinkBtn.style.display = 'inline-block';
      resendLinkBtn.addEventListener('click', async () => {
        try {
          await sendEmailVerification(user);
          alert('📩 Verification email sent.');
        } catch (error) {
          alert(`❌ ${error.message}`);
        }
      });
    }

    await loadUserContent(uid);

  } else {
    alert('⚠ You must be logged in to view this page.');
    window.location.href = 'login.html';
  }
});

// Sign out button
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await signOut(auth);
    alert('You have been logged out.');
    window.location.href = 'login.html';
  });
}

// Load user's bookmarks, comments, likes (from Firestore)
async function loadUserContent(uid) {
  try {
    // Bookmarks
    const bookmarksSnapshot = await getDocs(collection(db, 'users', uid, 'bookmarks'));
    bookmarksList.innerHTML = '';
    bookmarksSnapshot.forEach(doc => {
      const { title, url } = doc.data();
      const li = document.createElement('li');
      li.innerHTML = `<a href="${url}" target="_blank">${title}</a>`;
      bookmarksList.appendChild(li);
    });

    // Comments
    const commentsSnapshot = await getDocs(collection(db, 'users', uid, 'comments'));
    commentsList.innerHTML = '';
    commentsSnapshot.forEach(doc => {
      const { content, createdAt } = doc.data();
      const li = document.createElement('li');
      li.innerHTML = `"${content}" <small>(${new Date(createdAt).toLocaleString()})</small>`;
      commentsList.appendChild(li);
    });

    // Likes
    const likesSnapshot = await getDocs(collection(db, 'users', uid, 'likes'));
    likedContent.innerHTML = '';
    likesSnapshot.forEach(doc => {
      const { title, url } = doc.data();
      const li = document.createElement('li');
      li.innerHTML = `<a href="${url}" target="_blank">👍 ${title}</a>`;
      likedContent.appendChild(li);
    });

  } catch (error) {
    console.error('Error loading user data:', error);
    alert('❌ Failed to load user activity.');
  }
}
