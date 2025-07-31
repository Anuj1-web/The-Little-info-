// playlist.js
import { db, auth } from './firebase.js';
import {
  collection, getDocs, doc, updateDoc,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const playlistContainer = document.getElementById('userPlaylists');

onAuthStateChanged(auth, user => {
  if (user) {
    loadUserPlaylists(user.uid);
  } else {
    playlistContainer.innerHTML = "<p>Please log in to view your playlists.</p>";
  }
});

async function loadUserPlaylists(uid) {
  try {
    const playlistsSnap = await getDocs(collection(db, 'users', uid, 'playlists'));
    if (playlistsSnap.empty) {
      playlistContainer.innerHTML = "<p>No playlists found.</p>";
      return;
    }

    playlistContainer.innerHTML = "";
    playlistsSnap.forEach(docSnap => {
      const data = docSnap.data();
      const playlistId = docSnap.id;

      const card = document.createElement('div');
      card.className = 'content-card';

      const title = document.createElement('h2');
      title.textContent = data.title || "Untitled Playlist";

      const description = document.createElement('p');
      description.textContent = data.description || "";

      const publicToggle = document.createElement('label');
      publicToggle.className = "toggle-switch";
      publicToggle.innerHTML = `
        <input type="checkbox" ${data.public ? 'checked' : ''}>
        <span class="slider"></span>
        <span class="toggle-label">${data.public ? 'Public' : 'Private'}</span>
      `;

      const toggleInput = publicToggle.querySelector('input');
      toggleInput.addEventListener('change', async (e) => {
        const newVal = e.target.checked;
        await updateDoc(doc(db, 'users', uid, 'playlists', playlistId), {
          public: newVal
        });
        publicToggle.querySelector('.toggle-label').textContent = newVal ? 'Public' : 'Private';
        alert(`Playlist is now ${newVal ? 'public' : 'private'}.`);
      });

      // Optional: Embed a dummy video control UI (custom player integration needed)
      const controls = document.createElement('div');
      controls.className = 'video-controls';
      controls.innerHTML = `
        <label>Quality:
          <select>
            <option>Auto</option>
            <option>1080p</option>
            <option>720p</option>
            <option>480p</option>
          </select>
        </label>
        <label>Speed:
          <select>
            <option>1x</option>
            <option>1.5x</option>
            <option>2x</option>
            <option>0.5x</option>
          </select>
        </label>
        <label>Language:
          <select>
            <option>English</option>
            <option>Hindi</option>
            <option>Spanish</option>
          </select>
        </label>
      `;

      card.appendChild(title);
      card.appendChild(description);
      card.appendChild(publicToggle);
      card.appendChild(controls);
      playlistContainer.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading playlists:", err);
    playlistContainer.innerHTML = "<p>⚠ Failed to load playlists. Try again later.</p>";
  }
}
