import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ✅ Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCpoq_sjH_XLdJ1ZRc0ECFaglvXh3FIS5Q",
  authDomain: "the-little-info.firebaseapp.com",
  projectId: "the-little-info",
  storageBucket: "the-little-info.appspot.com",
  messagingSenderId: "165711417682",
  appId: "1:165711417682:web:cebb205d7d5c1f18802a8b",
  measurementId: "G-8KTFTYZBSL"
};

// ✅ Init
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ✅ Container
const container = document.getElementById("bookmarkContainer");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  try {
    const q = query(collection(db, "bookmarks"), where("userId", "==", user.uid));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      container.innerHTML = "<p class='animated-subtext'>No bookmarks yet.</p>";
      return;
    }

    container.innerHTML = "";

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const id = docSnap.id;

      const card = document.createElement("div");
      card.className = "dashboard-card fade-in";
      card.innerHTML = `
        <h3 contenteditable="false">${data.title || "Untitled"}</h3>
        <p contenteditable="false">${data.description || "No description"}</p>
        <small>📁 ${data.category || "N/A"}</small><br>
        <a href="${data.url}" target="_blank" class="btn">Open</a>
        <div style="margin-top: 10px;">
          <button class="edit-btn">✏️ Edit</button>
          <button class="delete-btn">🗑️ Delete</button>
          <button class="save-btn" style="display:none;">💾 Save</button>
        </div>
      `;

      const h3 = card.querySelector("h3");
      const p = card.querySelector("p");
      const editBtn = card.querySelector(".edit-btn");
      const deleteBtn = card.querySelector(".delete-btn");
      const saveBtn = card.querySelector(".save-btn");

      editBtn.addEventListener("click", () => {
        h3.contentEditable = true;
        p.contentEditable = true;
        h3.focus();
        saveBtn.style.display = "inline-block";
        editBtn.style.display = "none";
      });

      saveBtn.addEventListener("click", async () => {
        h3.contentEditable = false;
        p.contentEditable = false;
        await updateDoc(doc(db, "bookmarks", id), {
          title: h3.textContent.trim(),
          description: p.textContent.trim(),
          updatedAt: serverTimestamp()
        });
        saveBtn.style.display = "none";
        editBtn.style.display = "inline-block";
      });

      deleteBtn.addEventListener("click", async () => {
        if (confirm("Delete this bookmark?")) {
          await deleteDoc(doc(db, "bookmarks", id));
          card.remove();
        }
      });

      container.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading bookmarks:", err);
    container.innerHTML =
      "<p class='animated-subtext error'>Failed to load bookmarks.</p>";
  }
});
