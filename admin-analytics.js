// admin-analytics.js
import { db, auth } from './firebase.js';
import { collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

let totalViews = 0;
let totalLikes = 0;
let totalComments = 0;
let totalBookmarks = 0;
const viewsPerVideo = {};
const likesPerVideo = {};

const checkAdmin = async (user) => {
  const tokenResult = await user.getIdTokenResult();
  return !!tokenResult.claims.admin;
};

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    document.getElementById('admin-only-message').classList.remove('hidden');
    return;
  }

  const isAdmin = await checkAdmin(user);
  if (!isAdmin) {
    document.getElementById('admin-only-message').classList.remove('hidden');
    return;
  }

  document.getElementById('analytics-dashboard').classList.remove('hidden');

  const contentSnapshot = await getDocs(collection(db, 'content'));
  contentSnapshot.forEach((doc) => {
    const data = doc.data();
    const id = doc.id;

    totalViews += data.views || 0;
    totalLikes += data.likes || 0;
    totalComments += data.commentsCount || 0;
    totalBookmarks += data.bookmarksCount || 0;

    viewsPerVideo[data.title] = data.views || 0;
    likesPerVideo[data.title] = data.likes || 0;
  });

  document.getElementById('totalViews').textContent = `Total Views: ${totalViews}`;
  document.getElementById('totalLikes').textContent = `Total Likes: ${totalLikes}`;
  document.getElementById('totalComments').textContent = `Total Comments: ${totalComments}`;
  document.getElementById('totalBookmarks').textContent = `Total Bookmarks: ${totalBookmarks}`;

  renderChart('viewsChart', 'Views per Video', viewsPerVideo);
  renderChart('likesChart', 'Likes per Video', likesPerVideo);
});

function renderChart(canvasId, label, dataMap) {
  const ctx = document.getElementById(canvasId);
  const labels = Object.keys(dataMap);
  const data = Object.values(dataMap);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label,
        data,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}
