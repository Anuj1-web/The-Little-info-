// interactions.js
import { db } from './firebaseInit.js';
import { auth } from './firebase.js';
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

// DOM target
const interactionsContainer = document.getElementById('interactions-container');

// Show loading state
interactionsContainer.innerHTML = '<p class="loading-text">Loading your interactions...</p>';

// Animate card entrance
function animateCard(card) {
  card.style.opacity = 0;
  card.style.transform = 'translateY(20px)';
  requestAnimationFrame(() => {
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    card.style.opacity = 1;
    card.style.transform = 'translateY(0)';
  });
}

// Render a single interaction
function renderInteraction(item) {
  const card = document.createElement('div');
  card.className = 'interaction-card';

  card.innerHTML = `
    <h3>${item.title}</h3>
    <p>${item.comment ? `💬 ${item.comment}` : '👍 Liked this post'}</p>
    ${item.imageUrl ? `<img src="${item.imageUrl}" alt="media" style="max-width:100%; border-radius:8px;" />` : ''}
    <p class="meta"><strong>Category:</strong> ${item.category || 'Uncategorized'}</p>
    <p class="likes">❤️ ${item.likes || 0} likes</p>
  `;

  animateCard(card);
  interactionsContainer.appendChild(card);
}

// Fetch and render interactions
async function loadInteractions(userId) {
  interactionsContainer.innerHTML = ''; // Clear old content

  const commentsRef = collection(db, 'comments');
  const likesRef = collection(db, 'likes');

  const userCommentsQuery = query(commentsRef, where('userId', '==', userId));
  const userLikesQuery = query(likesRef, where('userId', '==', userId));

  const [commentsSnap, likesSnap] = await Promise.all([
    getDocs(userCommentsQuery),
    getDocs(userLikesQuery)
  ]);

  const allData = [];

  commentsSnap.forEach(doc => {
    allData.push({ ...doc.data(), type: 'comment' });
  });

  likesSnap.forEach(doc => {
    allData.push({ ...doc.data(), type: 'like' });
  });

  if (allData.length === 0) {
    interactionsContainer.innerHTML = '<p class="empty-message">No interactions yet.</p>';
    return;
  }

  allData.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds); // Recent first

  allData.forEach(item => renderInteraction(item));
}

// Auth check and load
onAuthStateChanged(auth, user => {
  if (user) {
    loadInteractions(user.uid);
  } else {
    interactionsContainer.innerHTML = '<p class="empty-message">Please log in to view your interactions.</p>';
  }
});
