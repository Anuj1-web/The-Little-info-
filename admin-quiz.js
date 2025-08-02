import { db, auth } from './firebase-config.js';
import { showToast } from './ui-utils.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const quizForm = document.getElementById('quizForm');
const quizList = document.getElementById('quizList');

onAuthStateChanged(auth, user => {
  if (!user) {
    showToast('Please log in to access this page.', 'error');
    window.location.href = 'login.html';
    return;
  }

  user.getIdTokenResult().then(tokenResult => {
    const isAdmin = tokenResult.claims.admin;
    if (!isAdmin) {
      showToast('Access denied. Admins only.', 'error');
      window.location.href = 'dashboard.html';
    } else {
      loadQuizzes();
    }
  });
});

quizForm.addEventListener('submit', async e => {
  e.preventDefault();

  const title = document.getElementById('quizTitle').value.trim();
  const question = document.getElementById('quizQuestion').value.trim();
  const answer = document.getElementById('quizAnswer').value.trim();

  if (!title || !question || !answer) {
    showToast('All fields are required.', 'error');
    return;
  }

  try {
    await addDoc(collection(db, 'admin_quizzes'), {
      title,
      question,
      answer,
      createdAt: serverTimestamp()
    });
    showToast('Quiz added successfully!', 'success');
    quizForm.reset();
  } catch (error) {
    console.error(error);
    showToast('Failed to add quiz.', 'error');
  }
});

function loadQuizzes() {
  const q = query(collection(db, 'admin_quizzes'), orderBy('createdAt', 'desc'));

  onSnapshot(q, snapshot => {
    quizList.innerHTML = '';
    if (snapshot.empty) {
      quizList.innerHTML = '<p>No quizzes uploaded yet.</p>';
      return;
    }

    snapshot.forEach(doc => {
      const data = doc.data();
      const card = document.createElement('div');
      card.className = 'topic-card fade-in';

      card.innerHTML = `
        <h3>${data.title}</h3>
        <p><strong>Q:</strong> ${data.question}</p>
        <p><strong>Answer:</strong> ${data.answer}</p>
        <small>Uploaded: ${data.createdAt?.toDate().toLocaleString() || 'Just now'}</small>
      `;
      quizList.appendChild(card);
    });
  });
}
