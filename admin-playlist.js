import { db, auth } from './firebase-config.js';
import { showToast } from './ui-utils.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
  doc,
  deleteDoc
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const form = document.getElementById('playlistForm');
const playlistList = document.getElementById('playlistList');
const videoSelector = document.getElementById('videoSelector');

let availableVideos = [];

onAuthStateChanged(auth, user => {
  if (!user) {
    showToast('Please log in to access this page.', 'error');
    window.location.href = 'login.html';
    return;
  }

  user.getIdTokenResult().then(tokenResult => {
    const isAdmin = tokenResult.claims.admin;
    if (!isAdmin) {
      showToast('Access denied. Admins only.', 'error');
      window.location.href = 'dashboard.html';
    } else {
      loadVideos();
      loadPlaylists();
    }
  });
});

async function loadVideos() {
  try {
    const querySnapshot = await getDocs(collection(db, 'explore'));
    availableVideos = [];

    querySnapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.title && data.videoUrl) {
        availableVideos.push({ title: data.title, url: data.videoUrl });
        const option = document.createElement('option');
        option.value = data.url || data.videoUrl;
        option.textContent = data.title;
        videoSelector.appendChild(option);
      }
    });

    if (availableVideos.length === 0) {
      const option = document.createElement('option');
      option.disabled = true;
      option.textContent = 'No videos found';
      videoSelector.appendChild(option);
    }
  } catch (err) {
    console.error('Error loading videos:', err);
    showToast('Failed to load videos.', 'error');
  }
}

form.addEventListener('submit', async e => {
  e.preventDefault();

  const selectedUrl = videoSelector.value;
  const selectedTitle = videoSelector.options[videoSelector.selectedIndex].textContent;

  if (!selectedUrl || !selectedTitle) {
    showToast('Please select a video.', 'error');
    return;
  }

  try {
    await addDoc(collection(db, 'admin_playlists'), {
      title: selectedTitle,
      url: selectedUrl,
      createdAt: serverTimestamp()
    });
    showToast('Playlist item added!', 'success');
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

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const card = document.createElement('div');
      card.className = 'topic-card fade-in';

      card.innerHTML = `
        <h3>${data.title}</h3>
        <p><a href="${data.url}" target="_blank">${data.url}</a></p>
        <small>Uploaded: ${data.createdAt?.toDate().toLocaleString() || 'Just now'}</small>
        <button class="btn" onclick="deletePlaylist('${docSnap.id}')">🗑 Delete</button>
      `;

      playlistList.appendChild(card);
    });
  });
}

window.deletePlaylist = async (id) => {
  if (!confirm('Are you sure you want to delete this playlist item?')) return;
  try {
    await deleteDoc(doc(db, 'admin_playlists', id));
    showToast('Playlist deleted.', 'success');
  } catch (err) {
    console.error("❌ Failed to delete:", err);
    showToast('Failed to delete.', 'error');
  }
};
