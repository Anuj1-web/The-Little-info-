import { db } from './firebaseInit.js';
import { collection, getDocs, updateDoc, doc, increment } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

const commentSection = document.getElementById('comment-section');

async function loadComments() {
  const querySnapshot = await getDocs(collection(db, "comments"));
  commentSection.innerHTML = '';

  querySnapshot.forEach(docSnap => {
    const data = docSnap.data();
    const card = document.createElement('div');
    card.className = 'dashboard-card';
    card.innerHTML = `
      <h3>${data.username || 'Anonymous'}</h3>
      <p>${data.comment}</p>
      <p style="margin-top: 10px; color: var(--primary);"><strong>Likes:</strong> <span id="like-count-${docSnap.id}">${data.likes || 0}</span></p>
      <button class="explore-btn" onclick="likeComment('${docSnap.id}')">❤️ Like</button>
    `;
    commentSection.appendChild(card);
  });
}

window.likeComment = async function(commentId) {
  const commentRef = doc(db, "comments", commentId);
  await updateDoc(commentRef, {
    likes: increment(1)
  });
  const countEl = document.getElementById(`like-count-${commentId}`);
  countEl.textContent = parseInt(countEl.textContent) + 1;
}

loadComments();
