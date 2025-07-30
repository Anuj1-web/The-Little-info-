// playlists.js
import { db, auth } from './firebase.js';
import {
  collection, getDocs, doc, updateDoc,
  deleteField, setDoc, onAuthStateChanged
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

    playlistsSnap.forEach(async docSnap => {
      const data = docSnap.data();
      const playlistId = docSnap.id;

      const card = document.createElement('div');
      card.className = 'content-card';

      const title = document.createElement('h2');
      title.textContent = data.title || "Untitled Playlist";

      const description = document.createElement('p');
      description.textContent = data.description || "";

      const publicToggle = document.createElement('label');
      publicToggle.innerHTML = `
        <input type="checkbox" ${data.public ? 'checked' : ''}>
        Public
      `;
      publicToggle.querySelector('input').addEventListener('change', async (e) => {
        await updateDoc(doc(db, 'users', uid, 'playlists', playlistId), {
          public: e.target.checked
        });

        if (e.target.checked) {
          // Copy to public_playlists
          await setDoc(doc(db, 'public_playlists', playlistId), {
            ...data,
            public: true
          });
        } else {
          // Remove from public_playlists
          await updateDoc(doc(db, 'public_playlists', playlistId), {
            public: false
          });
        }
      });

      const videoList = document.createElement('div');
      videoList.className = 'playlist-videos';

      (data.videos || []).forEach((video, index) => {
        const videoCard = document.createElement('div');
        videoCard.className = 'video-thumbnail';

        const videoElement = document.createElement('video');
        videoElement.src = video.url;
        videoElement.controls = true;
        videoElement.className = 'responsive-video';

        const title = document.createElement('p');
        title.textContent = video.title || "Untitled";

        const removeBtn = document.createElement('button');
        removeBtn.textContent = "Remove";
        removeBtn.addEventListener('click', async () => {
          const newVideos = data.videos.filter((_, i) => i !== index);
          await updateDoc(doc(db, 'users', uid, 'playlists', playlistId), {
            videos: newVideos
          });
          location.reload();
        });

        videoCard.appendChild(videoElement);
        videoCard.appendChild(title);
        videoCard.appendChild(removeBtn);
        videoList.appendChild(videoCard);
      });

      const shareLink = document.createElement('p');
      if (data.public) {
        const link = `${window.location.origin}/playlist.html?id=${playlistId}`;
        shareLink.innerHTML = `Share: <a href="${link}" target="_blank">${link}</a>`;
      }

      card.appendChild(title);
      card.appendChild(description);
      card.appendChild(publicToggle);
      card.appendChild(videoList);
      card.appendChild(shareLink);
      playlistContainer.appendChild(card);
    });

  } catch (err) {
    console.error("Failed to load playlists:", err);
    playlistContainer.innerHTML = "<p>Error loading playlists.</p>";
  }
}
