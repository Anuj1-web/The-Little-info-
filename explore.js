import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase config (use your actual config here)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM Target
const container = document.getElementById("exploreContainer");

// Load videos
async function loadVideos() {
  try {
    const querySnapshot = await getDocs(collection(db, "explore"));

    if (querySnapshot.empty) {
      container.innerHTML = "<p class='text-center text-lg'>No videos found.</p>";
      return;
    }

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const card = document.createElement("div");
      card.className = "topic-card";

      card.innerHTML = `
        <video
          src="${data.videoUrl}"
          controls
          poster="${data.thumbnail || ''}"
          class="w-full rounded-xl shadow-md hover:shadow-xl transition duration-300"
        ></video>
        <h3 class="mt-2 text-lg font-semibold">${data.title}</h3>
      `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading videos:", error);
    container.innerHTML = "<p class='text-red-500'>Error loading explore content.</p>";
  }
}

document.addEventListener("DOMContentLoaded", loadVideos);
