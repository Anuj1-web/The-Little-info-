// admin.js
import { auth, db } from './firebase.js';
import {
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
  // ✅ Role check only for current page
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      console.warn('User not logged in. Redirecting...');
      window.location.href = 'login.html';
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const role = userDoc.data().role?.toLowerCase();
        if (role !== 'admin') {
          console.warn('Not an admin. Redirecting...');
          window.location.href = 'dashboard.html';
        } else {
          console.log('Admin access granted');
        }
      } else {
        console.warn('User document missing. Redirecting...');
        window.location.href = 'dashboard.html';
      }
    } catch (err) {
      console.error('Error checking role:', err);
      window.location.href = 'dashboard.html';
    }
  });

  // ✅ Upload logic
  const uploadForm = document.getElementById('uploadForm');
  if (uploadForm) {
    uploadForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const title = document.getElementById('title').value.trim();
      const description = document.getElementById('description').value.trim();
      const category = document.getElementById('category').value;
      const content = document.getElementById('content').value.trim();
      const imageURL = document.getElementById('imageURL').value.trim();
      const videoURL = document.getElementById('videoURL').value.trim();

      if (!title || !description || !category) {
        alert('Please fill in all required fields');
        return;
      }

      try {
        await addDoc(collection(db, 'posts'), {
          title,
          description,
          category,
          content,
          imageURL,
          videoURL,
          createdAt: serverTimestamp()
        });

        alert('Upload successful!');
        uploadForm.reset();
      } catch (uploadError) {
        console.error('Upload failed:', uploadError);
        alert('Upload failed');
      }
    });
  }
});
