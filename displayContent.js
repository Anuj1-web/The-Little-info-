// Import Firebase SDK components from firebase.js (already included in your site)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { firebaseConfig } from './firebase.js'; // Make sure this file exists

// Initialize Firebase app and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fetch and display content
async function fetchAndDisplayContent() {
  const contentRef = collection(db, "content");
  const contentQuery = query(contentRef, orderBy("timestamp", "desc"));

  const querySnapshot = await getDocs(contentQuery);

  const trendingContainer = document.getElementById("trending-content");
  const traditionalContainer = document.getElementById("traditional-content");

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const contentBox = document.createElement("div");
    contentBox.classList.add("content-box");

    contentBox.innerHTML = `
      <h3>${data.title}</h3>
      <p>${data.description}</p>
    `;

    if (data.type === "trending") {
      trendingContainer.appendChild(contentBox);
    } else if (data.type === "traditional") {
      traditionalContainer.appendChild(contentBox);
    }
  });
}

// Call the function when the page loads
window.addEventListener("DOMContentLoaded", fetchAndDisplayContent);
