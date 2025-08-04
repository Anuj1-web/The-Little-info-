// traditional.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// ✅ Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCpoq_sjH_XLdJ1ZRc0ECFaglvXh3FIS5Q",
  authDomain: "the-little-info.firebaseapp.com",
  projectId: "the-little-info",
  storageBucket: "the-little-info.appspot.com",
  messagingSenderId: "165711417682",
  appId: "1:165711417682:web:cebb205d7d5c1f18802a8b"
};

// ✅ Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("traditionalContainer");

  try {
    // 🔍 Query documents where category == "traditional"
    const q = query(collection(db, "topics"), where("category", "==", "traditional"));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      container.innerHTML = "<p>No traditional topics found.</p>";
      return;
    }

    // ✅ Loop through documents and render cards
    querySnapshot.forEach(doc => {
      const data = doc.data();
      const card = document.createElement("div");
      card.className = "topic-card fade-in";

      card.innerHTML = `
        <h3>${data.title}</h3>
        <p>${data.description}</p>
        <span class="badge">#Traditional</span>
      `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading traditional topics:", error);
    container.innerHTML = "<p>Error loading traditional topics. Try again later.</p>";
  }
});
