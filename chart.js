// chart.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

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

async function fetchChartData() {
  const colRef = collection(db, "content");
  const snapshot = await getDocs(colRef);

  let trending = 0;
  let traditional = 0;
  let videos = 0;
  let images = 0;

  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.category === "trending") trending++;
    if (data.category === "traditional") traditional++;

    if (data.type?.startsWith("video")) videos++;
    if (data.type?.startsWith("image")) images++;
  });

  return { trending, traditional, videos, images };
}

async function renderChart() {
  const { trending, traditional, videos, images } = await fetchChartData();

  const ctx = document.getElementById('contentChart').getContext('2d');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Trending', 'Traditional', 'Videos', 'Images'],
      datasets: [{
        label: 'Content Stats',
        data: [trending, traditional, videos, images],
        backgroundColor: ['#00bcd4', '#ffc107', '#4caf50', '#ff5722'],
        borderRadius: 10,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      animation: {
        duration: 1000,
        easing: 'easeOutBounce'
      },
      plugins: {
        tooltip: {
          backgroundColor: '#222',
          titleColor: '#fff',
          bodyColor: '#ddd',
          padding: 10
        },
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#ccc'
          },
          grid: {
            color: '#444'
          }
        },
        x: {
          ticks: {
            color: '#ccc'
          },
          grid: {
            display: false
          }
        }
      }
    }
  });
}

renderChart();
