import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCpoq_sjH_XLdJ1ZRc0ECFaglvXh3FIS5Q",
  authDomain: "the-little-info.firebaseapp.com",
  projectId: "the-little-info",
  storageBucket: "the-little-info.appspot.com",
  messagingSenderId: "165711417682",
  appId: "1:165711417682:web:cebb205d7d5c1f18802a8b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// DOM target
const playlistContainer = document.getElementById("playlistContainer");

function createPlaylistCard(data) {
  const card = document.createElement("div");
  card.className = "topic-card fade-in";

  card.innerHTML = `
    <h3>${data.title}</h3>
    <p>${data.description}</p>
    <button class="btn explore-btn">Open</button>
  `;

  return card;
}

function showError(message) {
  const errorBox = document.createElement("div");
  errorBox.className = "toast error";
  errorBox.textContent = message;
  document.body.appendChild(errorBox);
  setTimeout(() => errorBox.remove(), 4000);
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const q = query(
        collection(db, "playlists"),
        where("ownerId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        playlistContainer.innerHTML = "<p>No playlists found.</p>";
        return;
      }

      playlistContainer.innerHTML = ""; // clear existing
      querySnapshot.forEach((doc) => {
        const card = createPlaylistCard(doc.data());
        playlistContainer.appendChild(card);
      });
    } catch (error) {
      console.error("Error loading playlists:", error);
      showError("Error loading playlists. Check your permissions.");
    }
  } else {
    playlistContainer.innerHTML = "<p>Please log in to view your playlists.</p>";
  }
});
