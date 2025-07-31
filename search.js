// search.js

// ✅ DOM Elements
const searchInput = document.getElementById('searchInput');
const resultsContainer = document.getElementById('resultsContainer');

// ✅ Sample Data (Replace with Firebase later)
const dummyData = [
  { title: "AI in Healthcare", description: "Exploring the impact of artificial intelligence in modern medical practices." },
  { title: "Climate Change Effects", description: "Understanding the global consequences of a warming planet." },
  { title: "Quantum Computing", description: "An introduction to the future of ultra-fast computation." },
  { title: "SpaceX Missions", description: "A breakdown of recent and upcoming rocket launches." },
  { title: "Machine Learning Basics", description: "Key terms and principles in supervised learning." }
];

// ✅ Listen for input
searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim().toLowerCase();
  resultsContainer.innerHTML = ''; // Clear old results

  if (query === '') return;

  const filtered = dummyData.filter(item =>
    item.title.toLowerCase().includes(query) ||
    item.description.toLowerCase().includes(query)
  );

  if (filtered.length === 0) {
    resultsContainer.innerHTML = `<p class="text-center text-gray-500 mt-4">No results found.</p>`;
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'result-card animate-fade-in';
    card.innerHTML = `
      <h3 class="text-lg font-semibold text-primary">${item.title}</h3>
      <p class="text-sm text-base-content mt-1">${item.description}</p>
    `;
    resultsContainer.appendChild(card);
  });
});

// ✅ Optional fade-in animation class (used by result-card)
document.addEventListener('DOMContentLoaded', () => {
  const style = document.createElement('style');
  style.textContent = `
    .animate-fade-in {
      animation: fadeIn 0.4s ease-in-out both;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .result-card {
      background-color: var(--card);
      border-radius: 0.75rem;
      padding: 1rem;
      margin-top: 1rem;
      box-shadow: var(--shadow);
      transition: transform 0.2s ease;
    }
    .result-card:hover {
      transform: translateY(-4px);
    }
  `;
  document.head.appendChild(style);
});
