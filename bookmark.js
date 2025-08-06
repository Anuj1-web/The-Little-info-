// ✅ Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ✅ Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ✅ DOM reference
const container = document.getElementById("bookmarkContainer");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  try {
    const q = query(
      collection(db, "bookmarks"),
      where("userId", "==", user.uid)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      container.innerHTML = "<p class='animated-subtext'>No bookmarks yet.</p>";
      return;
    }

    container.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();

      const card = document.createElement("div");
      card.className = "topic-card fade-in";

      card.innerHTML = `
        <h3>🔖 ${data.title || "Bookmarked Item"}</h3>
        <p>${data.description || "No description"}</p>
        <small>📁 Category: ${data.category || "N/A"}</small><br>
        <a href="${data.url}" target="_blank" class="btn">Open</a>
      `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error("🔥 Error loading bookmarks:", error);
    container.innerHTML =
      "<p class='animated-subtext error'>Failed to load bookmarks.</p>";
  }
});
