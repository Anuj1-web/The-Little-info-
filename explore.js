// Firebase Initialization (make sure firebase.js is imported before this script)
import { db } from './firebase.js';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-lite.js';

// DOM Elements
const gallery = document.getElementById('video-gallery');
const modal = document.getElementById('video-modal');
const modalVideo = document.getElementById('modal-video');
const modalClose = document.getElementById('modal-close');

// Create and return a video card element
function createVideoCard(data) {
  const card = document.createElement('div');
  card.className = 'video-card';

  const video = document.createElement('video');
  video.src = data.videoUrl;
  video.muted = true;
  video.playsInline = true;
  video.autoplay = true;
  video.loop = true;

  const title = document.createElement('div');
  title.className = 'video-title';
  title.textContent = data.title || 'Untitled Video';

  card.appendChild(video);
  card.appendChild(title);

  // Open modal on click
  card.addEventListener('click', () => {
    modal.classList.remove('hidden');
    modalVideo.src = data.videoUrl;
    modalVideo.play();
  });

  return card;
}

// Load videos from Firestore
async function loadExploreVideos() {
  try {
    const q = query(
      collection(db, 'content'),
      where('category', '==', 'Explore'),
      orderBy('timestamp', 'desc')
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      gallery.innerHTML = '<p>No explore videos available.</p>';
    } else {
      gallery.innerHTML = '';
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.videoUrl) {
          const card = createVideoCard(data);
          gallery.appendChild(card);
        }
      });
    }
  } catch (error) {
    console.error('Failed to load explore videos:', error);
    gallery.innerHTML = '<p>Error loading videos. Try again later.</p>';
  }
}

// Close modal
modalClose.addEventListener('click', () => {
  modal.classList.add('hidden');
  modalVideo.pause();
  modalVideo.src = '';
});

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  loadExploreVideos();
});
