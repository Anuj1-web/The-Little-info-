import { db, auth } from "./firebase.js";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";

// Load both sections
loadSection("trending", "trending-content");
loadSection("traditional", "traditional-content");

function loadSection(collectionName, containerId) {
  const ref = collection(db, collectionName);
  const q = query(ref, orderBy("timestamp", "desc"));

  onSnapshot(q, (snapshot) => {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const card = document.createElement("div");
      card.classList.add("content-card");
      card.dataset.id = docSnap.id;

      card.innerHTML = `
        <h3>${data.title}</h3>
        <p>${data.description}</p>
        <video src="${data.videoURL}" controls></video>
        <button class="bookmark-btn" data-id="${docSnap.id}">🔖 Bookmark</button>

        <div class="comment-section">
          <input type="text" class="comment-input" placeholder="Add a comment" />
          <button class="comment-btn">Post</button>
          <div class="comments-list"></div>
        </div>
      `;

      container.appendChild(card);

      // Comment button
      const commentBtn = card.querySelector(".comment-btn");
      commentBtn.addEventListener("click", () => {
        addComment(collectionName, docSnap.id, card);
      });

      // Load comments
      loadComments(collectionName, docSnap.id, card);
    });
  });
}

function addComment(collectionName, contentId, cardElement) {
  const input = cardElement.querySelector(".comment-input");
  const text = input.value.trim();

  if (!text) return;

  const currentUser = auth.currentUser;
  if (!currentUser) {
    alert("Login required to comment.");
    return;
  }

  const commentsRef = collection(db, `${collectionName}/${contentId}/comments`);
  addDoc(commentsRef, {
    text,
    userId: currentUser.uid,
    userEmail: currentUser.email,
    timestamp: serverTimestamp()
  }).then(() => {
    input.value = "";
  });
}

function loadComments(collectionName, contentId, cardElement) {
  const commentsList = cardElement.querySelector(".comments-list");
  const commentsRef = collection(db, `${collectionName}/${contentId}/comments`);
  const q = query(commentsRef, orderBy("timestamp", "desc"));

  onSnapshot(q, (snapshot) => {
    commentsList.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const comment = docSnap.data();
      const div = document.createElement("div");
      div.classList.add("comment");
      div.innerHTML = `
        <p><strong>${comment.userEmail}</strong>: ${comment.text}</p>
        ${
          auth.currentUser && auth.currentUser.uid === comment.userId
            ? `<button class="delete-comment" data-id="${docSnap.id}" data-content-id="${contentId}" data-type="${collectionName}">Delete</button>`
            : ""
        }
      `;
      commentsList.appendChild(div);
    });
  });
}

// Delete Comment
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("delete-comment")) {
    const commentId = e.target.dataset.id;
    const contentId = e.target.dataset.contentId;
    const type = e.target.dataset.type;

    await deleteDoc(doc(db, `${type}/${contentId}/comments/${commentId}`));
  }
});
