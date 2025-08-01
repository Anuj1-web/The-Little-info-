// trending.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
  // Your Firebase config here
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("trendingContainer");

  try {
    const q = query(collection(db, "topics"), where("category", "==", "trending"));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      container.innerHTML = "<p>No trending topics found.</p>";
      return;
    }

    querySnapshot.forEach(doc => {
      const data = doc.data();
      const card = document.createElement("div");
      card.className = "topic-card fade-in";

      card.innerHTML = `
        <h3>${data.title}</h3>
        <p>${data.description}</p>
        <span class="badge">#Trending</span>
      `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading trending topics:", error);
    container.innerHTML = "<p>Error loading trending topics. Try again later.</p>";
  }
});
