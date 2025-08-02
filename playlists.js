import { db } from './firebase.js';
import {
  collection,
  query,
  getDocs,
  where
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

const container = document.getElementById('playlistContainer');

async function loadPlaylists() {
  try {
    const q = query(collection(db, 'playlists'), where('status', '==', 'public'));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      container.innerHTML = '<p class="animated-subtext">No playlists available.</p>';
      return;
    }

    querySnapshot.forEach(doc => {
      const data = doc.data();

      const card = document.createElement('div');
      card.className = 'topic-card';
      card.innerHTML = `
        <h3>📺 ${data.title}</h3>
        <p>${data.description || 'No description provided.'}</p>
        <a href="${data.link}" target="_blank" class="btn">Watch Now</a>
      `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading playlists:', error);
    container.innerHTML = '<p class="animated-subtext error">Failed to load playlists.</p>';
  }
}

loadPlaylists();
