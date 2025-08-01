// admin.js
import { auth, db } from './firebase.js';
import {
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

// ✅ Admin authentication check
document.addEventListener('DOMContentLoaded', () => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = 'login.html';
      return;
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.role?.toLowerCase() !== 'admin') {
          window.location.href = 'dashboard.html';
        }
      } else {
        window.location.href = 'dashboard.html';
      }
    } catch (error) {
      console.error('Role check error:', error);
      window.location.href = 'dashboard.html';
    }
  });
});

// ✅ Form submission for uploading content
document.addEventListener('DOMContentLoaded', () => {
  const uploadForm = document.getElementById('uploadForm');
  if (!uploadForm) return;

  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const category = document.getElementById('category').value;
    const content = document.getElementById('content').value.trim();
    const imageURL = document.getElementById('imageURL').value.trim();
    const videoURL = document.getElementById('videoURL').value.trim();

    if (!title || !description || !category) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'posts'), {
        title,
        description,
        category,
        content,
        imageURL,
        videoURL,
        createdAt: serverTimestamp(),
      });

      alert('Content uploaded successfully!');
      uploadForm.reset();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload content. Please try again.');
    }
  });
});
