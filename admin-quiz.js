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

let editingId = null;

// ✅ Admin authentication and check
onAuthStateChanged(auth, async user => {
  if (!user) {
    showToast('Please log in to access this page.', 'error');
    window.location.href = 'login.html';
    return;
  }

  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists() || userSnap.data().role !== "admin") {
      showToast('Access denied. Admins only.', 'error');
      window.location.href = 'dashboard.html';
      return;
    }

    loadQuizzes(); // ✅ Load quizzes if admin

  } catch (error) {
    console.error("🔥 Error during admin check:", error);
    showToast('Failed to verify admin access.', 'error');
    window.location.href = 'dashboard.html';
  }
});

// ✅ Submit handler for Add / Update
quizForm.addEventListener('submit', async e => {
  e.preventDefault();

  const title = document.getElementById('quizTitle').value.trim();
  const question = document.getElementById('quizQuestion').value.trim();
  const optionA = document.getElementById('optionA').value.trim();
  const optionB = document.getElementById('optionB').value.trim();
  const optionC = document.getElementById('optionC').value.trim();
  const optionD = document.getElementById('optionD').value.trim();
  const answer = document.getElementById('correctAnswer').value.trim();

  if (!title || !question || !optionA || !optionB || !optionC || !optionD || !answer) {
    showToast('All fields are required.', 'error');
    return;
  }

  const quizData = {
    title,
    question,
    optionA,
    optionB,
    optionC,
    optionD,
    answer,
    createdAt: serverTimestamp()
  };

  try {
    if (editingId) {
      const quizRef = doc(db, 'quizzes', editingId);
      await updateDoc(quizRef, quizData);
      showToast('Quiz updated successfully!', 'success');
      editingId = null;
    } else {
      await addDoc(collection(db, 'quizzes'), quizData);
      showToast('Quiz added successfully!', 'success');
    }

    quizForm.reset();
  } catch (error) {
    console.error("❌ Failed to save quiz:", error);
    showToast('Failed to save quiz.', 'error');
  }
});

// ✅ Load and display quizzes in real-time
function loadQuizzes() {
  const q = query(collection(db, 'quizzes'), orderBy('createdAt', 'desc'));

  onSnapshot(q, snapshot => {
    quizList.innerHTML = '';
    if (snapshot.empty) {
      quizList.innerHTML = '<p>No quizzes uploaded yet.</p>';
      return;
    }

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const quizId = docSnap.id;

      const card = document.createElement('div');
      card.className = 'topic-card fade-in';

      card.innerHTML = `
        <h3>📝 ${data.title}</h3>
        <p><strong>Q:</strong> ${data.question}</p>
        <ul style="margin: 8px 0;">
          <li><strong>A:</strong> ${data.optionA}</li>
          <li><strong>B:</strong> ${data.optionB}</li>
          <li><strong>C:</strong> ${data.optionC}</li>
          <li><strong>D:</strong> ${data.optionD}</li>
        </ul>
        <p><strong>Correct Answer:</strong> ${data.answer}</p>
        <small>🕒 ${data.createdAt?.toDate().toLocaleString() || 'Just now'}</small>
        <div style="margin-top: 10px;">
          <button class="btn" onclick="editQuiz('${quizId}', \`${data.title}\`, \`${data.question}\`, \`${data.optionA}\`, \`${data.optionB}\`, \`${data.optionC}\`, \`${data.optionD}\`, \`${data.answer}\`)">✏️ Edit</button>
          <button class="btn" onclick="deleteQuiz('${quizId}')">🗑️ Delete</button>
        </div>
      `;

      quizList.appendChild(card);
    });
  });
}

// ✅ Global functions for editing & deleting
window.editQuiz = (id, title, question, optionA, optionB, optionC, optionD, answer) => {
  document.getElementById('quizTitle').value = title;
  document.getElementById('quizQuestion').value = question;
  document.getElementById('optionA').value = optionA;
  document.getElementById('optionB').value = optionB;
  document.getElementById('optionC').value = optionC;
  document.getElementById('optionD').value = optionD;
  document.getElementById('correctAnswer').value = answer;
  editingId = id;
  showToast('Editing quiz...', 'info');
};

window.deleteQuiz = async (id) => {
  if (!confirm("Are you sure you want to delete this quiz?")) return;

  try {
    await deleteDoc(doc(db, 'quizzes', id));
    showToast('Quiz deleted successfully!', 'success');
  } catch (error) {
    console.error("❌ Failed to delete quiz:", error);
    showToast('Failed to delete quiz.', 'error');
  }
};
