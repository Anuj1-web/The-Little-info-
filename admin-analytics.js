import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { showToast } from './utils.js';

const firebaseConfig = {
  apiKey: "AIzaSyCpoq_sjH_XLdJ1ZRc0ECFaglvXh3FIS5Q",
  authDomain: "the-little-info.firebaseapp.com",
  projectId: "the-little-info",
  storageBucket: "the-little-info.appspot.com",
  messagingSenderId: "165711417682",
  appId: "1:165711417682:web:cebb205d7d5c1f18802a8b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function loadAnalytics() {
  try {
    const userSnap = await getDocs(collection(db, "users"));
    const uploadSnap = await getDocs(collection(db, "content"));

    const userCount = userSnap.size;
    const uploadCount = uploadSnap.size;

    document.getElementById('userCount').textContent = userCount;
    document.getElementById('uploadCount').textContent = uploadCount;

    renderChart(userCount, uploadCount);
  } catch (error) {
    showToast("Error loading analytics", "error");
  }
}

function renderChart(users, uploads) {
  const ctx = document.getElementById('analyticsChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Users', 'Uploads'],
      datasets: [{
        label: 'Counts',
        data: [users, uploads],
        backgroundColor: ['#4CAF50', '#2196F3']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

window.addEventListener('DOMContentLoaded', loadAnalytics);
