// search.js
import { db } from './firebaseInit.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

const searchInput = document.getElementById('searchInput');
const filterSelect = document.getElementById('filterSelect');
const trendingContainer = document.getElementById('trending-content');
const traditionalContainer = document.getElementById('traditional-content');

// Fetch and filter content
async function fetchAndDisplayContent() {
  const contentRef = collection(db, 'content');
  const snapshot = await getDocs(contentRef);
  const allData = snapshot.docs.map(doc => doc.data());

  const keyword = searchInput.value.toLowerCase();
  const categoryFilter = filterSelect.value;

  const filtered = allData.filter(item => {
    const matchesKeyword =
      item.title.toLowerCase().includes(keyword) ||
      item.description.toLowerCase().includes(keyword) ||
      (item.tags && item.tags.join(' ').toLowerCase().includes(keyword));

    const matchesCategory =
      categoryFilter === 'all' || item.category === categoryFilter;

    return matchesKeyword && matchesCategory;
  });

  renderContent(filtered);
}

// Render search result
function renderContent(data) {
  trendingContainer.innerHTML = '';
  traditionalContainer.innerHTML = '';

  data.forEach(item => {
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('content-card');
    contentDiv.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.description}</p>
      ${item.videoUrl
        ? `<video controls src="${item.videoUrl}" style="max-width: 100%"></video>`
        : item.imageUrl
        ? `<img src="${item.imageUrl}" alt="Image" style="max-width: 100%" />`
        : '<p>No media available.</p>'
      }
      <p><strong>Category:</strong> ${item.category}</p>
    `;

    if (item.category === 'trending') {
      trendingContainer.appendChild(contentDiv);
    } else if (item.category === 'traditional') {
      traditionalContainer.appendChild(contentDiv);
    }
  });
}

// Event listeners
searchInput.addEventListener('input', fetchAndDisplayContent);
filterSelect.addEventListener('change', fetchAndDisplayContent);

// Initial load
fetchAndDisplayContent();
