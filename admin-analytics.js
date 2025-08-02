import { db, auth } from './firebase-config.js';
import { showToast } from './ui-utils.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
  collection,
  getDocs,
  query,
  where
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const statsContainer = document.getElementById('adminStats');

onAuthStateChanged(auth, async user => {
  if (!user) {
    showToast('Please log in first.', 'error');
    window.location.href = 'login.html';
    return;
  }

  const tokenResult = await user.getIdTokenResult();
  if (!tokenResult.claims.admin) {
    showToast('Admins only.', 'error');
    window.location.href = 'dashboard.html';
    return;
  }

  loadAnalytics();
});

async function loadAnalytics() {
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    const topicsSnap = await getDocs(collection(db, 'topics'));
    const playlistsSnap = await getDocs(collection(db, 'admin_playlists'));
    const quizzesSnap = await getDocs(collection(db, 'admin_quizzes'));

    const totalUsers = usersSnap.size;
    const totalTopics = topicsSnap.size;
    const totalPlaylists = playlistsSnap.size;
    const totalQuizzes = quizzesSnap.size;

    statsContainer.innerHTML = `
      <div class="stat-card fade-in">
        <h3>👥 Total Users</h3>
        <p>${totalUsers}</p>
      </div>
      <div class="stat-card fade-in">
        <h3>📚 Total Topics</h3>
        <p>${totalTopics}</p>
      </div>
      <div class="stat-card fade-in">
        <h3>🎵 Total Playlists</h3>
        <p>${totalPlaylists}</p>
      </div>
      <div class="stat-card fade-in">
        <h3>🧠 Total Quizzes</h3>
        <p>${totalQuizzes}</p>
      </div>
    `;
  } catch (error) {
    console.error(error);
    showToast('Failed to load analytics.', 'error');
  }
}
