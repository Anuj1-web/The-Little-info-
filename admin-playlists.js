import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy
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
        <div class="buttons">
          <a href="playlist.html?id=${playlist.id}" target="_blank" class="btn-view">View</a>
          <button class="btn-delete" data-id="${playlist.id}">Delete</button>
        </div>
      </div>
    `;

    adminPlaylistList.appendChild(card);
  });

  // Attach delete button listeners
  document.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.getAttribute("data-id");
      const confirmDelete = confirm("Are you sure you want to delete this playlist?");
      if (confirmDelete) {
        await deleteDoc(doc(db, "public_playlists", id));
        fetchPublicPlaylists(sortSelect.value); // Refresh list
      }
    });
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

  // Apply current sort
  if (sortSelect.value === "most_videos") {
    filtered.sort((a, b) => (b.videos?.length || 0) - (a.videos?.length || 0));
  } else {
    filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }

  displayPlaylists(filtered);
});

// Sort handler
sortSelect.addEventListener("change", () => {
  fetchPublicPlaylists(sortSelect.value);
});

// Initial load
fetchPublicPlaylists();
