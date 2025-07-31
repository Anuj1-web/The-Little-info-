// interactions.js
import { auth } from './firebase.js';
import {
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    console.log("Logged in as:", user.email);
  } else {
    alert("Please login to interact with content.");
    window.location.href = 'login.html';
  }
});

// Like
export function likeContent(contentId) {
  console.log(`👍 Liked: ${contentId}`);
  // Add your Firestore/Realtime DB logic here
}

// Bookmark
export function bookmarkContent(contentId) {
  console.log(`🔖 Bookmarked: ${contentId}`);
  // Save to user bookmarks DB
}

// Comment
export function commentContent(contentId, commentText) {
  if (!commentText.trim()) return alert("Comment cannot be empty.");
  console.log(`💬 Comment on ${contentId}: ${commentText}`);
  // Save to DB, append to UI
}

// UI Interactions
window.likeContent = likeContent;
window.bookmarkContent = bookmarkContent;
window.commentContent = function (id) {
  const input = document.getElementById(`commentInput-${id}`);
  if (input) {
    commentContent(id, input.value);
    input.value = '';
  }
};

window.logout = function () {
  signOut(auth).then(() => window.location.href = 'login.html');
};
