// admin.js
import { auth, db } from './firebase.js';
import {
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

// Ensure user is admin before showing panel
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      const role = data.role?.toLowerCase();

      if (role === 'admin') {
        document.querySelector('.auth-form-box.admin-panel').style.display = 'block';
      } else {
        alert('Access denied. Admins only.');
        window.location.href = 'dashboard.html';
      }
    } else {
      alert('User data not found.');
      window.location.href = 'dashboard.html';
    }
  } else {
    window.location.href = 'login.html';
  }
});

// Handle upload form submission
const uploadForm = document.getElementById('uploadForm');
if (uploadForm) {
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const category = document.getElementById('category').value;
    const bodyText = document.getElementById('bodyText').value.trim();
    const imageFile = document.getElementById('imageUpload').files[0];
    const videoFile = document.getElementById('videoUpload').files[0];

    try {
      let imageUrl = '';
      let videoUrl = '';

      // Upload image if exists
      if (imageFile) {
        const imageRef = ref(getStorage(), `images/${Date.now()}_${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      // Upload video if exists
      if (videoFile) {
        const videoRef = ref(getStorage(), `videos/${Date.now()}_${videoFile.name}`);
        await uploadBytes(videoRef, videoFile);
        videoUrl = await getDownloadURL(videoRef);
      }

      await addDoc(collection(db, 'topics'), {
        title,
        description,
        category,
        body: bodyText,
        imageUrl,
        videoUrl,
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser.uid
      });

      alert('Content uploaded successfully.');
      uploadForm.reset();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload content.');
    }
  });
}
