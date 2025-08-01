// recent-videos.js
import { getFirestore, collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { firebaseConfig } from "./firebaseConfig.js"; // 🔁 Make sure this file exports your config

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function loadRecentVideos() {
  const slider = document.getElementById("videoSlider");
  const q = query(collection(db, "posts"), orderBy("timestamp", "desc"), limit(10));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.videoURL) {
      const videoCard = document.createElement("div");
      videoCard.className = "video-card";
      videoCard.innerHTML = `
        <video controls class="video-preview">
          <source src="${data.videoURL}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
        <p class="video-title">${data.title || "Untitled"}</p>
      `;
      slider.appendChild(videoCard);
    }
  });
}

window.addEventListener("DOMContentLoaded", loadRecentVideos);
