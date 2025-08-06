import { db } from './firebase.js';
import {
  collection,
  query,
  getDocs,
  orderBy
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

const container = document.getElementById('quizContainer');

async function loadAdminQuizzes() {
  try {
    // ✅ Fetch from public quizzes collection (not admin-only)
    const q = query(collection(db, 'quizzes'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      container.innerHTML = '<p class="animated-subtext">No quizzes available yet.</p>';
      return;
    }

    querySnapshot.forEach(doc => {
      const data = doc.data();

      const card = document.createElement('div');
      card.className = 'topic-card fade-in';
      card.innerHTML = `
        <h3>📝 ${data.title}</h3>
        <p><strong>Q:</strong> ${data.question}</p>
        <p><strong>Answer:</strong> ${data.answer}</p>
      `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error('🔥 Failed to load quizzes:', error);
    container.innerHTML = '<p class="animated-subtext error">Failed to load quizzes.</p>';
  }
}

loadAdminQuizzes();
