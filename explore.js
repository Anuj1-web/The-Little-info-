// explore.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";

// ✅ Your actual Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCpoq_sjH_XLdJ1ZRc0ECFaglvXh3FIS5Q",
  authDomain: "the-little-info.firebaseapp.com",
  projectId: "the-little-info",
  storageBucket: "the-little-info.firebasestorage.app",
  messagingSenderId: "165711417682",
  appId: "1:165711417682:web:cebb205d7d5c1f18802a8b"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ✅ Main container to load content into
const container = document.getElementById("exploreContainer");

// ✅ Load explore content from Firestore
async function loadExploreContent() {
  try {
    const snapshot = await getDocs(collection(db, "explore"));

    if (snapshot.empty) {
      container.innerHTML = "<p>No content available.</p>";
      return;
    }

    snapshot.forEach((doc) => {
      const data = doc.data();
      const card = document.createElement("div");
      card.className = "topic-card fade-in";
      card.innerHTML = `
        <h3>${data.title || "Untitled"}</h3>
        <div class="video-wrapper">
          <video controls playsinline>
            <source src="${data.videoUrl}" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading explore content:", error);
    container.innerHTML = "<p>Failed to load content.</p>";
  }
}

// ✅ Run when the page is ready
document.addEventListener("DOMContentLoaded", loadExploreContent);
