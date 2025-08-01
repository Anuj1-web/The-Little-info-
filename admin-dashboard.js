// admin-dashboard.js
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, getDoc } from "firebase/firestore";
import { app } from "./firebase.js";

const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
  if (!user) return (window.location.href = "login.html");

  const userDoc = await getDoc(doc(db, "users", user.uid));
  const userData = userDoc.data();

  if (userData?.role !== "admin") {
    alert("❌ Access denied: Admins only.");
    window.location.href = "index.html";
  } else {
    console.log("✅ Admin dashboard access granted.");
    loadAdminDashboard();
  }
});

async function loadAdminDashboard() {
  const trendingCol = collection(db, "trending");
  const traditionalCol = collection(db, "traditional");

  const trendingSnap = await getDocs(trendingCol);
  const traditionalSnap = await getDocs(traditionalCol);

  displayContent("#trendingList", trendingSnap);
  displayContent("#traditionalList", traditionalSnap);
}

function displayContent(containerSelector, snapshot) {
  const container = document.querySelector(containerSelector);
  container.innerHTML = "";
  snapshot.forEach((doc) => {
    const data = doc.data();
    const card = document.createElement("div");
    card.className = "topic-card fade-in";
    card.innerHTML = `
      <h3>${data.title}</h3>
      <p>${data.description}</p>
      <button onclick="deleteContent('${doc.ref.path}')">Delete</button>
    `;
    container.appendChild(card);
  });
}

async function deleteContent(path) {
  await deleteDoc(doc(db, path));
  alert("Content deleted.");
  location.reload();
}
