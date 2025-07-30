// Fully Updated script.js with Step 1–8 features

import {
  getFirestore, collection, addDoc, getDocs, doc, setDoc, updateDoc, deleteDoc, getDoc, query, where, orderBy, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
  getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { app, auth, db } from './firebase.js';

// Global vars
let currentUser = null;

// Track Auth
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    document.getElementById("user-email")?.textContent = user.email;
    fetchAndDisplayBookmarks(user.uid);
    fetchAndDisplayPlaylists(user.uid);
    listenToNotifications(user.uid);
  }
});

// =============================
// 🔖 Bookmark Functions
// =============================
async function toggleBookmark(contentId, contentData) {
  const userId = currentUser.uid;
  const bookmarkRef = doc(db, "bookmarks", `${userId}_${contentId}`);
  const docSnap = await getDoc(bookmarkRef);

  if (docSnap.exists()) {
    await deleteDoc(bookmarkRef);
  } else {
    await setDoc(bookmarkRef, {
      userId,
      contentId,
      ...contentData,
      timestamp: new Date(),
    });
  }
  fetchAndDisplayBookmarks(userId);
}

async function fetchAndDisplayBookmarks(userId) {
  const q = query(collection(db, "bookmarks"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  const container = document.getElementById("bookmark-container");
  if (!container) return;
  container.innerHTML = "";
  snapshot.forEach((doc) => {
    const data = doc.data();
    const div = document.createElement("div");
    div.innerHTML = `
      <h4>${data.title}</h4>
      <video controls src="${data.videoUrl}" width="100%"></video>
      <button onclick="removeBookmark('${doc.id}')">Remove</button>
    `;
    container.appendChild(div);
  });
}

window.removeBookmark = async function (bookmarkId) {
  await deleteDoc(doc(db, "bookmarks", bookmarkId));
  fetchAndDisplayBookmarks(currentUser.uid);
}

// =============================
// 🎥 Playlist Functions
// =============================
window.addToPlaylist = async function (contentId, contentData) {
  const name = prompt("Enter playlist name:");
  if (!name) return;
  const playlistId = `${currentUser.uid}_${name}`;
  const ref = doc(db, "playlists", playlistId);
  const docSnap = await getDoc(ref);
  let videos = [];

  if (docSnap.exists()) {
    videos = docSnap.data().videos || [];
  }

  videos.push({ contentId, ...contentData });
  const publicStatus = confirm("Make playlist public?");

  await setDoc(ref, {
    userId: currentUser.uid,
    name,
    videos,
    public: publicStatus,
    updatedAt: new Date()
  });

  if (publicStatus) {
    await setDoc(doc(db, "public_playlists", playlistId), {
      ...videos,
      name,
      userId: currentUser.uid,
      updatedAt: new Date(),
      videos,
    });
  }
};

async function fetchAndDisplayPlaylists(userId) {
  const q = query(collection(db, "playlists"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  const container = document.getElementById("playlist-container");
  if (!container) return;
  container.innerHTML = "";
  snapshot.forEach((doc) => {
    const data = doc.data();
    const div = document.createElement("div");
    div.innerHTML = `
      <h4>${data.name}</h4>
      <p>${data.videos.length} videos</p>
      <a href="playlist.html?id=${doc.id}">View</a>
    `;
    container.appendChild(div);
  });
}

window.removeFromPlaylist = async function (playlistId, contentId) {
  const ref = doc(db, "playlists", playlistId);
  const snap = await getDoc(ref);
  const data = snap.data();
  const updated = data.videos.filter(v => v.contentId !== contentId);
  await updateDoc(ref, { videos: updated });

  if (data.public) {
    await updateDoc(doc(db, "public_playlists", playlistId), { videos: updated });
  }
  location.reload();
}

// =============================
// 🔔 Notifications
// =============================
function listenToNotifications(userId) {
  const dropdown = document.getElementById('notification-dropdown');
  const countBadge = document.getElementById('notification-count');

  const q = query(collection(db, "notifications"), where("recipientId", "==", userId), orderBy("timestamp", "desc"));

  onSnapshot(q, (snapshot) => {
    dropdown.innerHTML = '';
    let count = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      const item = document.createElement("div");
      item.className = "notification-item";
      item.innerHTML = `
        <strong>${data.title}</strong><br>
        <span>${data.message}</span>
      `;
      dropdown.appendChild(item);
      count++;
    });

    countBadge.textContent = count > 0 ? count : '';
  });
}

// =============================
// Export functions globally
// =============================
window.toggleBookmark = toggleBookmark;
window.addToPlaylist = addToPlaylist;
