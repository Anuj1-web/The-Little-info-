// Firebase setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCpoq_sjH_XLdJ1ZRc0ECFaglvXh3FIS5Q",
  authDomain: "the-little-info.firebaseapp.com",
  projectId: "the-little-info",
  storageBucket: "the-little-info.appspot.com",
  messagingSenderId: "165711417682",
  appId: "1:165711417682:web:cebb205d7d5c1f18802a8b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Fetch and display both Trending and Traditional content
function fetchAndDisplayContent() {
  loadContent("trending_content", "trending-section");
  loadContent("traditional_content", "traditional-section");
}

function loadContent(collectionName, sectionId) {
  const q = query(collection(db, collectionName), orderBy("timestamp", "desc"));

  getDocs(q)
    .then((snapshot) => {
      if (snapshot.empty) {
        document.getElementById(sectionId).innerHTML = "<p>No content available.</p>";
        return;
      }

      snapshot.forEach((doc) => {
        const data = doc.data();
        createContentCard(data, sectionId);
      });
    })
    .catch((error) => {
      console.error(`Error loading ${collectionName}:`, error);
    });
}

function createContentCard(data, sectionId) {
  const container = document.getElementById(sectionId);
  const card = document.createElement("div");
  card.classList.add("content-card");

  card.innerHTML = `
    <img src="${data.thumbnailURL}" alt="${data.title}" />
    <h3>${data.title}</h3>
    <p>${data.description}</p>
    <a href="${data.videoURL}" target="_blank">Watch</a>
  `;

  container.appendChild(card);
}

// Run after page load
window.addEventListener("DOMContentLoaded", () => {
  fetchAndDisplayContent();

  // Auth state (optional for UI updates)
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("Logged in:", user.email);
    } else {
      console.log("No user logged in");
    }
  });
});
