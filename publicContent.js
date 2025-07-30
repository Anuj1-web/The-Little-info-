import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const trendingContainer = document.getElementById("trending-content");
const traditionalContainer = document.getElementById("traditional-content");

// Fetch and display content
async function fetchContent() {
  const q = query(collection(db, "content"), orderBy("timestamp", "desc"));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const contentBox = document.createElement("div");
    contentBox.className = "content-card";
    contentBox.innerHTML = `
      <h4>${data.title}</h4>
      <p>${data.description}</p>
      ${data.type === "video"
        ? `<video controls width="100%"><source src="${data.url}" type="video/mp4"></video>`
        : `<img src="${data.url}" alt="${data.title}" style="width:100%;border-radius:12px;">`}
    `;

    if (data.category === "Trending") {
      trendingContainer.appendChild(contentBox);
    } else if (data.category === "Traditional") {
      traditionalContainer.appendChild(contentBox);
    }
  });
}

fetchContent();
