// admin.js (✅ Updated to fix redirect issue and upload handling)

import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { app } from "./firebase-config.js"; // Make sure this path is correct

const auth = getAuth(app);
const db = getFirestore(app);

// ✅ Admin Role Check & Stop Redirect
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      showToast("User data not found.");
      return;
    }

    const role = userDoc.data().role;
    if (role !== "admin") {
      window.location.href = "admin-dashboard.html";
    } else {
      console.log("✅ Admin verified, staying on admin.html");
    }
  } else {
    window.location.href = "login.html";
  }
});

// ✅ Upload Logic
const uploadForm = document.getElementById("uploadForm");
if (uploadForm) {
  uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const category = document.getElementById("category").value;
    const content = document.getElementById("content").value.trim();
    const imageURL = document.getElementById("imageURL").value.trim();
    const videoURL = document.getElementById("videoURL").value.trim();

    if (!title || !description || !category) {
      showToast("Please fill in all required fields.");
      return;
    }

    try {
      const postRef = collection(db, "topics");
      await addDoc(postRef, {
        title,
        description,
        category,
        content,
        imageURL,
        videoURL,
        createdAt: serverTimestamp(),
        postedBy: auth.currentUser.uid,
      });

      showToast("✅ Content uploaded successfully.");
      uploadForm.reset();
    } catch (err) {
      console.error("Upload failed", err);
      showToast("❌ Upload failed. Try again.");
    }
  });
}

// ✅ Toast Utility
function showToast(message) {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
