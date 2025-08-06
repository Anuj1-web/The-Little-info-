import { db, auth } from './firebase-config.js';
import { showToast } from './ui-utils.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  doc,
  getDoc,
  deleteDoc,
  updateDoc
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const quizForm = document.getElementById('quizForm');
const quizList = document.getElementById('quizList');

onAuthStateChanged(auth, async user => {
  if (!user) {
    showToast('Please log in to access this page.', 'error');
    window.location.href = 'login.html';
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists() || userSnap.data().role !== "admin") {
    showToast('Access denied. Admins only.', 'error');
    window.location.href = 'dashboard.html';
    return;
  }

  loadQuizzes();
});

quizForm.addEventListener('submit', async e => {
  e.preventDefault();

  const title = document.getElementById('quizTitle').value.trim();
  const question = document.getElementById('quizQuestion').value.trim();
  const answer = document.getElementById('correctAnswer').value.trim();

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
    console.error("❌ Failed to add quiz:", error);
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

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const docId = docSnap.id;

      const card = document.createElement('div');
      card.className = 'topic-card fade-in';

      card.innerHTML = `
        <h3 class="quiz-title" contenteditable="false">${data.title}</h3>
        <p><strong>Q:</strong> <span class="quiz-question" contenteditable="false">${data.question}</span></p>
        <p><strong>Answer:</strong> <span class="quiz-answer" contenteditable="false">${data.answer}</span></p>
        <small>Uploaded: ${data.createdAt?.toDate().toLocaleString() || 'Just now'}</small>
        <div class="quiz-actions">
          <button class="btn edit-btn">✏️ Edit</button>
          <button class="btn delete-btn">🗑️ Delete</button>
        </div>
      `;

      const editBtn = card.querySelector('.edit-btn');
      const deleteBtn = card.querySelector('.delete-btn');

      const titleEl = card.querySelector('.quiz-title');
      const questionEl = card.querySelector('.quiz-question');
      const answerEl = card.querySelector('.quiz-answer');

      editBtn.addEventListener('click', async () => {
        const isEditing = editBtn.textContent === '💾 Save';

        if (!isEditing) {
          titleEl.contentEditable = true;
          questionEl.contentEditable = true;
          answerEl.contentEditable = true;
          editBtn.textContent = '💾 Save';
        } else {
          titleEl.contentEditable = false;
          questionEl.contentEditable = false;
          answerEl.contentEditable = false;
          editBtn.textContent = '✏️ Edit';

          const newTitle = titleEl.textContent.trim();
          const newQuestion = questionEl.textContent.trim();
          const newAnswer = answerEl.textContent.trim();

          try {
            await updateDoc(doc(db, 'admin_quizzes', docId), {
              title: newTitle,
              question: newQuestion,
              answer: newAnswer
            });
            showToast('Quiz updated!', 'success');
          } catch (err) {
            console.error("❌ Update failed:", err);
            showToast('Update failed.', 'error');
          }
        }
      });

      deleteBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this quiz?')) {
          try {
            await deleteDoc(doc(db, 'admin_quizzes', docId));
            showToast('Quiz deleted.', 'success');
          } catch (err) {
            console.error("❌ Delete failed:", err);
            showToast('Delete failed.', 'error');
          }
        }
      });

      quizList.appendChild(card);
    });
  });
}
