// upload.js - Handles admin content uploading & content categorization

// Ensure Firebase is initialized before this script runs
const storage = firebase.storage();
const db = firebase.firestore();

const uploadForm = document.getElementById("uploadForm");
const uploadStatus = document.getElementById("uploadStatus");

uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const category = document.querySelector('input[name="category"]:checked')?.value;
  const file = document.getElementById("file").files[0];

  if (!file || !category) {
    uploadStatus.textContent = "Please select a file and category.";
    return;
  }

  const storageRef = storage.ref(`uploads/${Date.now()}_${file.name}`);
  const uploadTask = storageRef.put(file);

  uploadStatus.textContent = "Uploading...";

  uploadTask.on(
    "state_changed",
    null,
    (error) => {
      uploadStatus.textContent = `Upload failed: ${error.message}`;
    },
    async () => {
      const downloadURL = await storageRef.getDownloadURL();
      await db.collection("content").add({
        title,
        description,
        url: downloadURL,
        type: file.type.startsWith("video") ? "video" : "image",
        category,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });
      uploadStatus.textContent = "Upload successful!";
      uploadForm.reset();
    }
  );
});
