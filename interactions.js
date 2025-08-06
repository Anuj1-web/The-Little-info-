// interactions.js

// ✅ Import both auth and db from the same Firebase context
import { db, auth } from './firebaseInit.js';

import {
  collection,
  query,
  where,
  getDocs
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

// DOM target
const interactionsContainer = document.getElementById('interactions-container');

// Show initial loading state
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

// Render a single interaction card
function renderInteraction(item) {
  const card = document.createElement('div');
  card.className = 'interaction-card';

  const timestamp = item.timestamp?.seconds
    ? new Date(item.timestamp.seconds * 1000).toLocaleString()
    : 'Unknown time';

  card.innerHTML = `
    <h3>${item.title}</h3>
    <p>${item.comment ? `💬 ${item.comment}` : '👍 Liked this post'}</p>
    ${item.imageUrl ? `<img src="${item.imageUrl}" alt="media" style="max-width:100%; border-radius:8px;" />` : ''}
    <p class="meta"><strong>Category:</strong> ${item.category || 'Uncategorized'}</p>
    <p class="likes">❤️ ${item.likes || 0} likes</p>
    <p class="timestamp">🕒 ${timestamp}</p>
  `;

  animateCard(card);
  interactionsContainer.appendChild(card);
}

// Fetch and render user interactions (comments + likes)
async function loadInteractions(userId) {
  interactionsContainer.innerHTML = ''; // Clear previous content

  const commentsRef = collection(db, 'comments');
  const likesRef = collection(db, 'likes');

  const userCommentsQuery = query(commentsRef, where('userId', '==', userId));
  const userLikesQuery = query(likesRef, where('userId', '==', userId));

  try {
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

    // Sort by timestamp descending
    allData.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));

    allData.forEach(item => renderInteraction(item));

  } catch (error) {
    console.error("Error loading interactions:", error);
    interactionsContainer.innerHTML = '<p class="error-message">Failed to load interactions. Please try again later.</p>';
  }
}

// Listen for auth state change and load data
onAuthStateChanged(auth, user => {
  if (user) {
    loadInteractions(user.uid);
  } else {
    interactionsContainer.innerHTML = '<p class="empty-message">Please log in to view your interactions.</p>';
  }
});
