// admin-analytics.js
import { db, auth } from './firebase.js';
import { collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const totalViewsEl = document.getElementById('totalViews');
const totalLikesEl = document.getElementById('totalLikes');
const totalCommentsEl = document.getElementById('totalComments');
const totalBookmarksEl = document.getElementById('totalBookmarks');
const dashboardEl = document.getElementById('analytics-dashboard');
const adminMessage = document.getElementById('admin-only-message');

let viewsData = {};
let likesData = {};

function renderCharts() {
  const viewLabels = Object.keys(viewsData);
  const viewCounts = Object.values(viewsData);

  new Chart(document.getElementById('viewsChart'), {
    type: 'bar',
    data: {
      labels: viewLabels,
      datasets: [{
        label: 'Views per Video',
        data: viewCounts,
        backgroundColor: 'rgba(75, 192, 192, 0.6)'
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } }
    }
  });

  const likeLabels = Object.keys(likesData);
  const likeCounts = Object.values(likesData);

  new Chart(document.getElementById('likesChart'), {
    type: 'pie',
    data: {
      labels: likeLabels,
      datasets: [{
        label: 'Likes per Video',
        data: likeCounts,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)'
        ]
      }]
    },
    options: { responsive: true }
  });
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const token = await user.getIdTokenResult();
    if (token.claims.admin) {
      dashboardEl.classList.remove('hidden');
      loadAnalytics();
    } else {
      adminMessage.classList.remove('hidden');
    }
  } else {
    window.location.href = '/login.html';
  }
});

async function loadAnalytics() {
  const contentsSnap = await getDocs(collection(db, 'content'));
  let totalViews = 0, totalLikes = 0, totalComments = 0, totalBookmarks = 0;

  contentsSnap.forEach((doc) => {
    const data = doc.data();
    const title = data.title || doc.id;

    const views = data.views || 0;
    const likes = data.likes || 0;
    const comments = data.commentCount || 0;
    const bookmarks = data.bookmarkedBy ? data.bookmarkedBy.length : 0;

    totalViews += views;
    totalLikes += likes;
    totalComments += comments;
    totalBookmarks += bookmarks;

    viewsData[title] = views;
    likesData[title] = likes;
  });

  totalViewsEl.textContent = `Total Views: ${totalViews}`;
  totalLikesEl.textContent = `Total Likes: ${totalLikes}`;
  totalCommentsEl.textContent = `Total Comments: ${totalComments}`;
  totalBookmarksEl.textContent = `Total Bookmarks: ${totalBookmarks}`;

  renderCharts();
}
