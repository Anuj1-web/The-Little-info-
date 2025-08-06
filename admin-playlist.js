// ✅ Full updated admin-playlist.js
import { db, auth } from './firebase-config.js';
import { showToast } from './ui-utils.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  doc,
  getDoc
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const form = document.getElementById('playlistForm');
const playlistList = document.getElementById('playlistList');
const videoSelect = document.getElementById('videoSelect');

onAuthStateChanged(auth, async user => {
  if (!user) {
    showToast('Please log in to access this page.', 'error');
    window.location.href = 'login.html';
    return;
  }

  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists() || userSnap.data().role !== "admin") {
      showToast('Access denied. Admins only.', 'error');
      window.location.href = 'dashboard.html';
      return;
    }

    console.log("✅ Admin verified");
    await populateVideoList();
    loadPlaylists();
  } catch (err) {
    console.error("Admin check failed:", err);
    showToast('Access denied.', 'error');
    window.location.href = 'dashboard.html';
  }
});

// ✅ Load videos from 'explore' collection into dropdown
async function populateVideoList() {
  try {
    if (!videoSelect) return;

    const q = query(collection(db, 'explore'), orderBy('uploadedAt', 'desc'));
    const snapshot = await getDocs(q);

    videoSelect.innerHTML = '<option value="">-- Select a video --</option>';

    snapshot.forEach(doc => {
      const video = doc.data();
      const option = document.createElement('option');
      option.value = video.videoUrl;
      option.textContent = video.title || "Untitled Video";
      videoSelect.appendChild(option);
    });
  } catch (err) {
    console.error("Failed to load videos:", err);
    showToast("Error loading videos.", "error");
  }
}

form.addEventListener('submit', async e => {
  e.preventDefault();

  const title = document.getElementById('playlistTitle').value.trim();
  const videoUrl = videoSelect?.value;

  if (!title || !videoUrl) {
    showToast('Please select a video and enter a title.', 'error');
    return;
  }

  try {
    await addDoc(collection(db, 'admin_playlists'), {
      title,
      url: videoUrl,
      createdAt: serverTimestamp(),
      public: true // ✅ visible to users
    });

    showToast('Playlist added successfully!', 'success');
    form.reset();
    if (videoSelect) videoSelect.selectedIndex = 0;
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
    
  }, error => {
    console.error("Snapshot listener failed:", error);
    showToast('Permission denied or error loading playlists.', 'error');
  });
}
