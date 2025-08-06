// 🧩 Inject animations and card styles
const style = document.createElement("style");
style.textContent = `
  .interaction-card {
    background: linear-gradient(to bottom right, #1f1f1f, #2b2b2b);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 1.5rem;
    color: #fff;
    animation: fadeIn 0.5s ease;
    box-shadow: 0 4px 14px rgba(255, 255, 255, 0.1);
  }

  .interaction-card h3 {
    margin-bottom: 6px;
    color: var(--primary);
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);

// 🔥 Firebase imports
import { db, auth } from './firebase.js';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import {
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

// 🔍 DOM reference
const container = document.getElementById('interactionContainer');

// 🧠 Load interactions
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    container.innerHTML = '<p>Please log in to view your interactions.</p>';
    return;
  }

  try {
    const q = query(
      collection(db, 'interactions'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      container.innerHTML = '<p class="animated-subtext">No interactions yet.</p>';
      return;
    }

    container.innerHTML = '';
    snapshot.forEach(doc => {
      const data = doc.data();
      const card = document.createElement('div');
      card.className = 'interaction-card';

      card.innerHTML = `
        <h3>💬 ${data.type || 'Interaction'}</h3>
        <p>${data.message || 'No message available.'}</p>
        <small>🕒 ${new Date(data.timestamp?.seconds * 1000).toLocaleString()}</small>
      `;

      container.appendChild(card);
    });

  } catch (err) {
    console.error('❌ Error loading interactions:', err);
    container.innerHTML = '<p class="animated-subtext error">Failed to load interactions. Please try again later.</p>';
  }
});
