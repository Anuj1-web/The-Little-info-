import { db, auth } from './firebase.js';
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import {
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

// DOM reference
const interactionsContainer = document.getElementById('interactionsContainer');

// Wait for authentication
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    interactionsContainer.innerHTML = "<p class='animated-subtext error'>Please log in to view your interactions.</p>";
    return;
  }

  const userId = user.uid;
  const q = query(collection(db, 'interactions'), where('userId', '==', userId));

  // Real-time updates
  onSnapshot(q, (snapshot) => {
    interactionsContainer.innerHTML = '';

    if (snapshot.empty) {
      interactionsContainer.innerHTML = "<p class='animated-subtext'>No interactions found.</p>";
      return;
    }

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();

      const card = document.createElement('div');
      card.className = 'topic-card fade-in';
      card.innerHTML = `
        <h3>${data.title || 'Untitled Interaction'}</h3>
        <p>${data.description || 'No description'}</p>
        <small>📅 ${new Date(data.timestamp?.toDate()).toLocaleString()}</small>
      `;
      interactionsContainer.appendChild(card);
    });
  }, (error) => {
    console.error('Error loading interactions:', error);
    interactionsContainer.innerHTML = "<p class='animated-subtext error'>Failed to load interactions.</p>";
  });
});
