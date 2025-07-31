// upload.js - Admin content uploader

import { storage, db } from './firebaseInit.js';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const uploadForm = document.getElementById("uploadForm");
const uploadStatus = document.getElementById("uploadStatus");

uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const category = document.getElementById("category").value;
  const file = document.getElementById("file").files[0];

  if (!file || !category || !title || !description) {
    uploadStatus.textContent = "⚠️ Please fill out all fields.";
    uploadStatus.style.color = "orange";
    return;
  }

  const storagePath = `uploads/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, storagePath);
  const uploadTask = uploadBytesResumable(storageRef, file);

  uploadStatus.textContent = "⏳ Uploading...";
  uploadStatus.style.color = "#00bfff";

  uploadTask.on(
    "state_changed",
    (snapshot) => {
      const progress = Math.floor((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
      uploadStatus.textContent = `Uploading... ${progress}%`;
    },
    (error) => {
      uploadStatus.textContent = `❌ Upload failed: ${error.message}`;
      uploadStatus.style.color = "red";
    },
    async () => {
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
      await addDoc(collection(db, "content"), {
        title,
        description,
        category,
        url: downloadURL,
        timestamp: serverTimestamp()
      });

      uploadStatus.textContent = "✅ Upload successful!";
      uploadStatus.style.color = "lightgreen";
      uploadForm.reset();
    }
  );
});
