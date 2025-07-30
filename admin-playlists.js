import { db } from "./firebase.js";
import { collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const adminPlaylistList = document.getElementById("adminPlaylistList");
const searchInput = document.getElementById("playlistSearch");

// Fetch all public playlists
async function fetchPublicPlaylists() {
  const snapshot = await getDocs(collection(db, "public_playlists"));
  const playlists = [];
  snapshot.forEach((doc) => {
    playlists.push({ id: doc.id, ...doc.data() });
  });
  displayPlaylists(playlists);
}

// Render playlist cards
function displayPlaylists(playlists) {
  adminPlaylistList.innerHTML = "";

  if (playlists.length === 0) {
    adminPlaylistList.innerHTML = "<p>No public playlists found.</p>";
    return;
  }

  playlists.forEach((playlist) => {
    const card = document.createElement("div");
    card.className = "playlist-card";

    const firstVideo = playlist.videos?.[0] || {};
    const thumb = firstVideo.thumbnail || "https://via.placeholder.com/320x180?text=No+Thumbnail";
    const time = playlist.createdAt ? new Date(playlist.createdAt).toLocaleString() : "Unknown";

    card.innerHTML = `
      <img src="${thumb}" class="thumbnail" alt="Thumbnail">
      <div class="playlist-details">
        <h3>${playlist.title}</h3>
        <p>${playlist.description || "No description provided."}</p>
        <p><strong>Videos:</strong> ${playlist.videos?.length || 0}</p>
        <p><strong>Tag:</strong> ${playlist.tag || "None"}</p>
        <p><strong>Created:</strong> ${time}</p>
        <a href="playlist.html?id=${playlist.id}" target="_blank" class="btn-view">View</a>
      </div>
    `;

    adminPlaylistList.appendChild(card);
  });
}

// Filter playlists by title or tag
searchInput.addEventListener("input", async () => {
  const keyword = searchInput.value.toLowerCase();
  const snapshot = await getDocs(collection(db, "public_playlists"));
  const filtered = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    const title = data.title?.toLowerCase() || "";
    const tag = data.tag?.toLowerCase() || "";
    if (title.includes(keyword) || tag.includes(keyword)) {
      filtered.push({ id: doc.id, ...data });
    }
  });
  displayPlaylists(filtered);
});

// Initial load
fetchPublicPlaylists();
