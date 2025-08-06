// upload.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// 🔧 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCpoq_sjH_XLdJ1ZRc0ECFaglvXh3FIS5Q",
  authDomain: "the-little-info.firebaseapp.com",
  projectId: "the-little-info",
  storageBucket: "the-little-info.appspot.com",
  messagingSenderId: "165711417682",
  appId: "1:165711417682:web:cebb205d7d5c1f18802a8b"
};

// 🚀 Initialize
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// 📌 DOM Elements
const form = document.getElementById("uploadForm");
const uploadBtn = document.getElementById("uploadBtn");
const progressBar = document.getElementById("uploadProgress");
const formBox = document.querySelector(".auth-form-box");

// 🔒 Hide until admin check
formBox.style.display = "none";

// ✅ Admin Check
onAuthStateChanged(auth, async user => {
  if (!user) {
    alert("You must be logged in.");
    window.location.href = "login.html";
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists() || userSnap.data().role !== "admin") {
    alert("Access denied. Admins only.");
    window.location.href = "dashboard.html";
    return;
  }

  // ✅ Admin verified
  formBox.style.display = "block";
});

// 🧠 Handle Upload
form.addEventListener("submit", async e => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const category = document.getElementById("category").value;
  const fileInput = document.getElementById("mediaFile");
  const file = fileInput.files[0];

  if (!title || !category || !file) {
    alert("Please fill in all fields and select a file.");
    return;
  }

  try {
    uploadBtn.disabled = true;
    uploadBtn.textContent = "Uploading...";
    progressBar.style.display = "block";
    progressBar.value = 0;

    // 🔄 Storage Ref
    const filePath = `${category}/${Date.now()}-${file.name}`;
    const storageRef = ref(storage, filePath);

    const uploadTask = uploadBytesResumable(storageRef, file);

    // 🔁 Progress Tracker
    uploadTask.on(
      "state_changed",
      snapshot => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        progressBar.value = progress;
      },
      error => {
        console.error("Upload failed:", error);
        alert("Upload failed. Try again.");
        uploadBtn.disabled = false;
        uploadBtn.textContent = "Upload";
        progressBar.style.display = "none";
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);

        const contentData = {
          title,
          description,
          category,
          url,
          type: file.type.startsWith("video/") ? "video" : file.type.startsWith("image/") ? "image" : "document",
          uploadedBy: auth.currentUser.uid,
          createdAt: serverTimestamp()
        };

        await addDoc(collection(db, "content"), contentData);

        alert("Content uploaded successfully!");
        form.reset();
        progressBar.value = 0;
        progressBar.style.display = "none";
        uploadBtn.disabled = false;
        uploadBtn.textContent = "Upload";
      }
    );
  } catch (err) {
    console.error("Upload error:", err);
    alert("Unexpected error occurred.");
    uploadBtn.disabled = false;
    uploadBtn.textContent = "Upload";
    progressBar.style.display = "none";
  }
});
