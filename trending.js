// trending.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase Config (replace if needed)
const firebaseConfig = {
  apiKey: "AIzaSyCpoq_sjH_XLdJ1ZRc0ECFaglvXh3FIS5Q",
  authDomain: "the-little-info.firebaseapp.com",
  projectId: "the-little-info",
  storageBucket: "the-little-info.firebasestorage.app",
  messagingSenderId: "165711417682",
  appId: "1:165711417682:web:cebb205d7d5c1f18802a8b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fetch and display trending topics
document.addEventListener("DOMContentLoaded", async () => {
  const trendingContainer = document.getElementById("trendingContainer");
  trendingContainer.innerHTML = "<p>Loading...</p>";

  try {
    const q = query(collection(db, "topics"), where("category", "==", "trending"));
    const snapshot = await getDocs(q);

    trendingContainer.innerHTML = "";

    if (snapshot.empty) {
      trendingContainer.innerHTML = "<p>No trending topics found.</p>";
      return;
    }

    snapshot.forEach((doc) => {
      const data = doc.data();
      const card = document.createElement("div");
      card.className = "topic-card animated-card";
      card.innerHTML = `
        <h3>${data.title}</h3>
        <p>${data.description}</p>
        <small>By ${data.author || "Anonymous"}</small>
      `;
      trendingContainer.appendChild(card);
    });
  } catch (error) {
    trendingContainer.innerHTML = `<p class="error">Failed to load topics: ${error.message}</p>`;
    console.error("Error loading trending topics:", error);
  }
});
