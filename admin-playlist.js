import { db, auth } from './firebase-config.js';
import { showToast } from './ui-utils.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const form = document.getElementById('playlistForm');
const playlistList = document.getElementById('playlistList');

onAuthStateChanged(auth, user => {
  if (!user) {
    showToast('Please log in to access this page.', 'error');
    window.location.href = 'login.html';
    return;
  }

  // Optional: restrict to admin-only
  user.getIdTokenResult().then(tokenResult => {
    const isAdmin = tokenResult.claims.admin;
    if (!isAdmin) {
      showToast('Access denied. Admins only.', 'error');
      window.location.href = 'dashboard.html';
    } else {
      loadPlaylists();
    }
  });
});

form.addEventListener('submit', async e => {
  e.preventDefault();
  const title = document.getElementById('playlistTitle').value.trim();
  const url = document.getElementById('playlistURL').value.trim();

  if (!title || !url) {
    showToast('Please fill in all fields.', 'error');
    return;
  }

  try {
    await addDoc(collection(db, 'admin_playlists'), {
      title,
      url,
      createdAt: serverTimestamp()
    });
    showToast('Playlist added successfully!', 'success');
    form.reset();
  } catch (error) {
    console.error(error);
    showToast('Failed to add playlist.', 'error');
  }
});

function loadPlaylists() {
  const q = query(collection(db, 'admin_playlists'), orderBy('createdAt', 'desc'));

  onSnapshot(q, snapshot => {
    playlistList.innerHTML = '';
    if (snapshot.empty) {
      playlistList.innerHTML = '<p>No playlists uploaded yet.</p>';
      return;
    }

    snapshot.forEach(doc => {
      const data = doc.data();
      const card = document.createElement('div');
      card.className = 'topic-card fade-in';

      card.innerHTML = `
        <h3>${data.title}</h3>
        <p><a href="${data.url}" target="_blank">${data.url}</a></p>
        <small>Uploaded: ${data.createdAt?.toDate().toLocaleString() || 'Just now'}</small>
      `;

      playlistList.appendChild(card);
    });
  });
}
