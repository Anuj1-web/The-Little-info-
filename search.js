// search.js

document.addEventListener('DOMContentLoaded', () => {
  // ✅ DOM Elements
  const searchInput = document.getElementById('searchInput');
  const resultsContainer = document.getElementById('resultsContainer');

  if (!searchInput || !resultsContainer) {
    console.warn("❗ Missing searchInput or resultsContainer in HTML.");
    return;
  }

  // ✅ Sample Data (replace with Firebase later)
  const dummyData = [
    { title: "AI in Healthcare", description: "Exploring the impact of artificial intelligence in modern medical practices." },
    { title: "Climate Change Effects", description: "Understanding the global consequences of a warming planet." },
    { title: "Quantum Computing", description: "An introduction to the future of ultra-fast computation." },
    { title: "SpaceX Missions", description: "A breakdown of recent and upcoming rocket launches." },
    { title: "Machine Learning Basics", description: "Key terms and principles in supervised learning." }
  ];

  // ✅ Handle input
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    resultsContainer.innerHTML = '';

    if (query === '') return;

    const filtered = dummyData.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
      resultsContainer.innerHTML = `<p class="animated-subtext">No results found.</p>`;
      return;
    }

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'result-card fade-in';
      card.innerHTML = `
        <h3 class="text-lg font-semibold text-primary">${item.title}</h3>
        <p class="text-sm text-base-content mt-1">${item.description}</p>
      `;
      resultsContainer.appendChild(card);
    });
  });

  // ✅ Inject animation + card styles
  const style = document.createElement('style');
  style.textContent = `
    .fade-in {
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
    .animated-subtext {
      text-align: center;
      color: var(--text-muted);
      margin-top: 1.5rem;
    }
  `;
  document.head.appendChild(style);
});
