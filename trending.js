import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Your Firebase config (update if changed)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("trendingContainer");

  if (!container) {
    console.error("❌ Container with ID 'trendingContainer' not found.");
    return;
  }

  try {
    const q = query(collection(db, "topics"), where("category", "==", "trending"));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      container.innerHTML = "<p>No trending topics found.</p>";
      return;
    }

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      const card = document.createElement("div");
      card.className = "topic-card animate-fade-in";
      card.innerHTML = `
        <h3>${data.title || "Untitled Topic"}</h3>
        <p>${data.description || "No description available."}</p>
        <span class="tag">${data.category}</span>
      `;

      container.appendChild(card);
    });

  } catch (error) {
    console.error("🔥 Error fetching trending topics:", error);
    container.innerHTML = `<p class="error">Error loading topics. Please try again later.</p>`;
  }
});
