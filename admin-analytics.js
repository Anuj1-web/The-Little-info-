// admin-analytics.js
import { db, auth } from './firebase.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

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

    totalViews += data.views || 0;
    totalLikes += data.likes || 0;
    totalComments += data.commentsCount || 0;
    totalBookmarks += data.bookmarksCount || 0;

    viewsPerVideo[data.title] = data.views || 0;
    likesPerVideo[data.title] = data.likes || 0;
  });

  document.getElementById('totalViews').textContent = `📊 Total Views: ${totalViews}`;
  document.getElementById('totalLikes').textContent = `❤️ Total Likes: ${totalLikes}`;
  document.getElementById('totalComments').textContent = `💬 Total Comments: ${totalComments}`;
  document.getElementById('totalBookmarks').textContent = `🔖 Total Bookmarks: ${totalBookmarks}`;

  const topContainer = document.getElementById('topVideos');
  Object.entries(viewsPerVideo).forEach(([title, views]) => {
    const div = document.createElement('div');
    div.classList.add('video-stat');
    div.innerHTML = `<strong>${title}</strong>: ${views} views, ${likesPerVideo[title] || 0} likes`;
    topContainer.appendChild(div);
  });
});
