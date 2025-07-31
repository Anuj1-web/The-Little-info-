import { db, auth } from "./firebaseInit.js";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import "./interactions.js"; // Enable like, bookmark, comment

const trendingDiv = document.getElementById("trending-content");
const traditionalDiv = document.getElementById("traditional-content");

async function loadContent() {
  const q = query(collection(db, "content"), orderBy("timestamp", "desc"));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const card = document.createElement("div");
    card.classList.add("content-card");

    const media = data.videoURL
      ? `<video width="100%" controls preload="metadata">
          <source src="${data.videoURL}" type="video/mp4" />
        </video>`
      : data.imageURL
      ? `<img src="${data.imageURL}" alt="${data.title}" class="upload-preview" />`
      : "";

    card.innerHTML = `
      <h3>${data.title}</h3>
      <p>${data.description}</p>
      ${media}
      <div class="interactions">
        <button onclick="likePost('${docSnap.id}')">👍 Like</button>
        <button onclick="bookmarkPost('${docSnap.id}')">🔖 Bookmark</button>
      </div>
      <div class="comments">
        <input type="text" id="comment-${docSnap.id}" placeholder="Add a comment"/>
        <button onclick="postComment('${docSnap.id}')">Post</button>
      </div>
    `;

    if (data.category.toLowerCase() === "trending") {
      trendingDiv.appendChild(card);
    } else if (data.category.toLowerCase() === "traditional") {
      traditionalDiv.appendChild(card);
    }
  });
}

onAuthStateChanged(auth, (user) => {
  if (user && user.emailVerified) {
    loadContent();
  } else {
    loadContent(); // allow public viewing
  }
});
