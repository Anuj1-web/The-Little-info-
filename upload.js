// upload.js - Admin content uploader

import { storage, db } from './firebaseInit.js';
import { ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const uploadForm = document.getElementById("uploadForm");
const uploadStatus = document.getElementById("uploadStatus");
const previewContainer = document.getElementById("previewContainer");

uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const category = document.getElementById("category").value;
  const file = document.getElementById("file").files[0];

  if (!file || !category || !title || !description) {
    uploadStatus.textContent = "❌ Please fill out all fields.";
    return;
  }

  const filePath = `uploads/${Date.now()}_${file.name}`;
  const fileRef = ref(storage, filePath);
  const uploadTask = uploadBytesResumable(fileRef, file);

  uploadStatus.textContent = "📤 Uploading...";

  uploadTask.on(
    "state_changed",
    null,
    (error) => {
      uploadStatus.textContent = `❌ Upload failed: ${error.message}`;
    },
    async () => {
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

      await addDoc(collection(db, "content"), {
        title,
        description,
        category,
        mediaUrl: downloadURL,
        fileType: file.type.startsWith("image/") ? "image" : "video",
        createdAt: serverTimestamp(),
      });

      uploadStatus.textContent = "✅ Upload successful!";
      uploadForm.reset();

      // Optional preview
      let previewHTML = `<h3>Preview</h3><p><strong>Title:</strong> ${title}</p><p><strong>Description:</strong> ${description}</p><p><strong>Category:</strong> ${category}</p>`;

      if (file.type.startsWith("image/")) {
        previewHTML += `<img src="${downloadURL}" style="max-width: 300px; margin-top: 10px;" />`;
      } else if (file.type.startsWith("video/")) {
        previewHTML += `<video controls src="${downloadURL}" style="max-width: 300px; margin-top: 10px;"></video>`;
      }

      previewContainer.innerHTML = previewHTML;
    }
  );
});
