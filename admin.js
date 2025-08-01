import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const storage = getStorage(app);

const imageFileInput = document.getElementById("imageFile");
const videoFileInput = document.getElementById("videoFile");
const previewContainer = document.getElementById("previewContainer");
const progressContainer = document.querySelector(".progress-bar-container");
const progressBar = document.getElementById("uploadProgress");

function showPreview(files, type) {
  Array.from(files).forEach((file) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      if (type === "image") {
        const img = document.createElement("img");
        img.src = e.target.result;
        previewContainer.appendChild(img);
      } else if (type === "video") {
        const vid = document.createElement("video");
        vid.src = e.target.result;
        vid.controls = true;
        previewContainer.appendChild(vid);
      }
    };
    reader.readAsDataURL(file);
  });
}

imageFileInput.addEventListener("change", (e) => {
  previewContainer.innerHTML = "";
  showPreview(e.target.files, "image");
});

videoFileInput.addEventListener("change", (e) => {
  showPreview(e.target.files, "video");
});

uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  const category = categoryInput.value.trim();
  const content = contentInput.value.trim();
  const imageFiles = imageFileInput.files;
  const videoFiles = videoFileInput.files;

  if (!title || !description || !category) {
    showToast("❌ Title, description & category are required.");
    return;
  }

  progressContainer.style.display = "block";
  progressBar.style.width = "0%";

  try {
    const imageURLs = [];
    const videoURLs = [];

    for (const file of imageFiles) {
      const imageRef = ref(storage, `images/${Date.now()}_${file.name}`);
      await uploadWithProgress(imageRef, file);
      const url = await getDownloadURL(imageRef);
      imageURLs.push(url);
    }

    for (const file of videoFiles) {
      const videoRef = ref(storage, `videos/${Date.now()}_${file.name}`);
      await uploadWithProgress(videoRef, file);
      const url = await getDownloadURL(videoRef);
      videoURLs.push(url);
    }

    await addDoc(collection(db, "topics"), {
      title,
      description,
      category,
      content,
      imageURLs,
      videoURLs,
      createdAt: serverTimestamp(),
      postedBy: auth.currentUser.uid,
    });

    showToast("✅ Upload successful!");
    uploadForm.reset();
    previewContainer.innerHTML = "";
    progressBar.style.width = "0%";
    progressContainer.style.display = "none";
  } catch (err) {
    console.error("Upload failed", err);
    showToast("❌ Upload failed. Please try again.");
  }
});

function uploadWithProgress(storageRef, file) {
  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file);
    task.on(
      "state_changed",
      (snapshot) => {
        const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        progressBar.style.width = `${percent.toFixed(0)}%`;
      },
      reject,
      () => resolve()
    );
  });
}
