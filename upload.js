// upload.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
const formBox = document.querySelector(".auth-form-box");

// Wait for auth state and check admin
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("You must be logged in to access this page.");
    window.location.href = "login.html";
    return;
  }

  const tokenResult = await user.getIdTokenResult();
  if (!tokenResult.claims.admin) {
    alert("Access denied. You must be an admin to upload content.");
    window.location.href = "dashboard.html";
    return;
  }

  // Admin confirmed; show form
  formBox.style.display = "block";
});

// Hide form until admin verified
formBox.style.display = "none";

// Handle upload
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  uploadBtn.disabled = true;
  uploadBtn.textContent = "Uploading...";

  const title = document.getElementById("mediaTitle").value;
  const description = document.getElementById("mediaDescription").value;
  const category = document.getElementById("category").value;
  const type = document.getElementById("mediaType").value;
  const file = document.getElementById("mediaFile").files[0];

  if (!file || !title || !description || !category || !type) {
    alert("Please fill all fields.");
    uploadBtn.disabled = false;
    uploadBtn.textContent = "Upload";
    return;
  }

  try {
    const storageRef = ref(storage, `${category}/${Date.now()}-${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    const contentDoc = {
      title,
      description,
      type,
      url,
      category,
      uploadedBy: auth.currentUser.uid,
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, "content"), contentDoc);

    alert("Content uploaded successfully!");
    form.reset();
  } catch (err) {
    console.error(err);
    alert("Upload failed. Please try again.");
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.textContent = "Upload";
  }
});
