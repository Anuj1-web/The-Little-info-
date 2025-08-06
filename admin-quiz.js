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

onAuthStateChanged(auth, async user => {
  if (!user) {
    console.log("❌ No user logged in");
    showToast('Please log in to access this page.', 'error');
    window.location.href = 'login.html';
    return;
  }

  console.log("✅ Logged in UID:", user.uid);

  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.log("❌ User document does not exist.");
      showToast('Access denied. Admins only.', 'error');
      window.location.href = 'dashboard.html';
      return;
    }

    const userData = userSnap.data();
    console.log("🧾 User Data:", userData);

    if (userData.role !== "admin") {
      console.log("❌ Not an admin. Role is:", userData.role);
      showToast('Access denied. Admins only.', 'error');
      window.location.href = 'dashboard.html';
      return;
    }

    console.log("✅ Admin verified. Loading quizzes...");
    loadQuizzes();

  } catch (error) {
    console.error("🔥 Error during admin check:", error);
    showToast('Failed to verify admin access.', 'error');
    window.location.href = 'dashboard.html';
  }
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
    if (editingId) {
      const quizRef = doc(db, 'quizzes', editingId);
      await updateDoc(quizRef, { title, question, answer });
      showToast('Quiz updated successfully!', 'success');
      editingId = null;
    } else {
      await addDoc(collection(db, 'quizzes'), {
        title,
        question,
        answer,
        createdAt: serverTimestamp()
      });
      showToast('Quiz added successfully!', 'success');
    }

    quizForm.reset();
  } catch (error) {
    console.error("❌ Failed to save quiz:", error);
    showToast('Failed to save quiz.', 'error');
  }
});

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
        <h3>${data.title}</h3>
        <p><strong>Q:</strong> ${data.question}</p>
        <p><strong>Answer:</strong> ${data.answer}</p>
        <small>Uploaded: ${data.createdAt?.toDate().toLocaleString() || 'Just now'}</small>
        <div style="margin-top: 10px;">
          <button class="btn" onclick="editQuiz('${quizId}', \`${data.title}\`, \`${data.question}\`, \`${data.answer}\`)">✏️ Edit</button>
          <button class="btn" onclick="deleteQuiz('${quizId}')">🗑️ Delete</button>
        </div>
      `;

      quizList.appendChild(card);
    });
  });
}

// Attach these functions globally
window.editQuiz = (id, title, question, answer) => {
  document.getElementById('quizTitle').value = title;
  document.getElementById('quizQuestion').value = question;
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
