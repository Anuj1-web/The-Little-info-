// interactions.js
import { db, auth } from './firebase.js';
import {
  collection,
  getDocs,
  query,
  where
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import {
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

const container = document.getElementById('interactions-list');

// Utility to create animated interaction cards
function createInteractionCard(type, data) {
  const card = document.createElement('div');
  card.className = 'dashboard-card interaction-card';
  card.innerHTML = `
    <h3>${type === 'like' ? '❤️ Liked' : '💬 Commented'}</h3>
    <p><strong>Content:</strong> ${data.contentTitle || 'Untitled'}</p>
    <p>${type === 'comment' ? `<strong>Comment:</strong> ${data.commentText}` : ''}</p>
    <p style="font-size: 0.9rem; opacity: 0.7;">Date: ${new Date(data.timestamp).toLocaleString()}</p>
  `;
  card.style.animation = 'fadeInUp 0.6s ease';
  return card;
}

// Fetch and render all user interactions
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert('You must be logged in to view your interactions.');
    window.location.href = 'login.html';
    return;
  }

  const uid = user.uid;

  // Load Likes
  const likesRef = collection(db, 'likes');
  const likesQuery = query(likesRef, where('userId', '==', uid));
  const likeSnapshot = await getDocs(likesQuery);
  likeSnapshot.forEach(doc => {
    const like = doc.data();
    const card = createInteractionCard('like', like);
    container.appendChild(card);
  });

  // Load Comments
  const commentsRef = collection(db, 'comments');
  const commentQuery = query(commentsRef, where('userId', '==', uid));
  const commentSnapshot = await getDocs(commentQuery);
  commentSnapshot.forEach(doc => {
    const comment = doc.data();
    const card = createInteractionCard('comment', comment);
    container.appendChild(card);
  });

  if (container.innerHTML.trim() === '') {
    container.innerHTML = `<p style="text-align:center; color:var(--text);">You haven't interacted with anything yet.</p>`;
  }
});
