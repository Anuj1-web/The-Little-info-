import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const adminPlaylistList = document.getElementById("adminPlaylistList");
const searchInput = document.getElementById("playlistSearch");
const sortSelect = document.getElementById("sortSelect");

// Fetch all public playlists
async function fetchPublicPlaylists(sortOption = "newest") {
  const snapshot = await getDocs(collection(db, "public_playlists"));
  let playlists = [];
  snapshot.forEach((doc) => {
    playlists.push({ id: doc.id, ...doc.data() });
  });

  // Apply sorting
  if (sortOption === "newest") {
    playlists.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } else if (sortOption === "most_videos") {
    playlists.sort((a, b) => (b.videos?.length || 0) - (a.videos?.length || 0));
  }

  displayPlaylists(playlists);
}

// Render playlists
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
    const thumb =
      firstVideo.thumbnail ||
      "https://via.placeholder.com/320x180?text=No+Thumbnail";

    card.innerHTML = `
      <img src="${thumb}" class="playlist-thumb" />
      <div class="playlist-info">
        <h3>${playlist.title}</h3>
        <p><strong>Category:</strong> ${playlist.category || "Uncategorized"}</p>
        <p><strong>Videos:</strong> ${playlist.videos?.length || 0}</p>
        <p><strong>Created:</strong> ${playlist.createdAt ? new Date(playlist.createdAt).toLocaleDateString() : "N/A"}</p>
        <button class="delete-btn" data-id="${playlist.id}">🗑️ Delete</button>
      </div>
    `;

    adminPlaylistList.appendChild(card);
  });

  // Add delete listeners
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      if (confirm("Are you sure you want to delete this playlist?")) {
        await deleteDoc(doc(db, "public_playlists", id));
        fetchPublicPlaylists(sortSelect.value);
      }
    });
  });
}

// Search playlists
searchInput.addEventListener("input", () => {
  const term = searchInput.value.toLowerCase();
  const cards = document.querySelectorAll(".playlist-card");
  cards.forEach((card) => {
    const title = card.querySelector("h3").textContent.toLowerCase();
    card.style.display = title.includes(term) ? "flex" : "none";
  });
});

// Sort change
sortSelect.addEventListener("change", () => {
  fetchPublicPlaylists(sortSelect.value);
});

// Initial load
fetchPublicPlaylists();
