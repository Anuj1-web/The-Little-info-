// upload.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCpoq_sjH_XLdJ1ZRc0ECFaglvXh3FIS5Q",
  authDomain: "the-little-info.firebaseapp.com",
  projectId: "the-little-info",
  storageBucket: "the-little-info.appspot.com",
  messagingSenderId: "165711417682",
  appId: "1:165711417682:web:cebb205d7d5c1f18802a8b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

// DOM references
const form = document.getElementById("uploadForm");
const uploadBtn = document.getElementById("uploadBtn");
const progressBar = document.getElementById("uploadProgress"); // <--- NEW
const formBox = document.querySelector(".auth-form-box");

// Hide form until admin verified
formBox.style.display = "none";

// Auth check
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("You must be logged in to access this page.");
    window.location.href = "login.html";
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists() || userSnap.data().role !== "admin") {
    alert("Access denied. You must be an admin to upload content.");
    window.location.href = "dashboard.html";
    return;
  }

  formBox.style.display = "block"; // ✅ Show form for admin
});

// Handle Upload
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  uploadBtn.disabled = true;
  uploadBtn.textContent = "Uploading...";

  const title = document.getElementById("mediaTitle")?.value.trim();
  const description = document.getElementById("mediaDescription")?.value.trim();
  const category = document.getElementById("category")?.value.trim();
  const type = document.getElementById("mediaType")?.value.trim();
  const fileInput = document.getElementById("mediaFile");
  const file = fileInput?.files[0];

  if (!title || !description || !category || !type || !file) {
    alert("Please fill in all fields and select a file.");
    uploadBtn.disabled = false;
    uploadBtn.textContent = "Upload";
    return;
  }

  try {
    const storageRef = ref(storage, `${category}/${Date.now()}-${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Listen for upload progress
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        if (progressBar) {
          progressBar.style.display = "block";
          progressBar.value = percent;
        }
        uploadBtn.textContent = `Uploading ${percent}%`;
      },
      (error) => {
        console.error("Upload error:", error);
        alert("Upload failed. Please try again.");
        uploadBtn.disabled = false;
        uploadBtn.textContent = "Upload";
        if (progressBar) progressBar.style.display = "none";
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

        const contentDoc = {
          title,
          description,
          type,
          url: downloadURL,
          category,
          uploadedBy: auth.currentUser.uid,
          createdAt: serverTimestamp()
        };

        await addDoc(collection(db, "content"), contentDoc);

        alert("✅ Content uploaded successfully!");
        form.reset();
        uploadBtn.disabled = false;
        uploadBtn.textContent = "Upload";
        if (progressBar) {
          progressBar.style.display = "none";
          progressBar.value = 0;
        }
      }
    );
  } catch (error) {
    console.error(error);
    alert("Upload failed. Please try again.");
    uploadBtn.disabled = false;
    uploadBtn.textContent = "Upload";
    if (progressBar) progressBar.style.display = "none";
  }
});
