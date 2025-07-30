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

let allTrending = [];
let allTraditional = [];

const searchInput = document.getElementById('search-input');
const filterSelect = document.getElementById('filter-select');
const tagSelect = document.getElementById('tag-select');
const sortSelect = document.getElementById('sort-select');

searchInput.addEventListener("input", renderFilteredContent);
filterSelect.addEventListener("change", renderFilteredContent);
tagSelect.addEventListener("change", renderFilteredContent);
sortSelect.addEventListener("change", renderFilteredContent);

loadSection("trending");
loadSection("traditional");

function loadSection(collectionName) {
  const ref = collection(db, collectionName);
  const q = query(ref, orderBy("timestamp", "desc"));

  onSnapshot(q, (snapshot) => {
    const results = [];
    snapshot.forEach((docSnap) => {
      results.push({ id: docSnap.id, data: docSnap.data() });
    });

    if (collectionName === "trending") allTrending = results;
    else allTraditional = results;

    renderFilteredContent();
  });
}

function renderFilteredContent() {
  const keyword = searchInput.value.toLowerCase();
  const tag = tagSelect.value;
  const filter = filterSelect.value;
  const sort = sortSelect.value;

  const trendingContainer = document.getElementById("trending-content");
  const traditionalContainer = document.getElementById("traditional-content");
  trendingContainer.innerHTML = "";
  traditionalContainer.innerHTML = "";

  let renderList = [];

  if (filter === "all" || filter === "trending") {
    renderList = renderList.concat(allTrending.map(item => ({ ...item, type: "trending" })));
  }

  if (filter === "all" || filter === "traditional") {
    renderList = renderList.concat(allTraditional.map(item => ({ ...item, type: "traditional" })));
  }

  // Filter by search + tag
  renderList = renderList.filter(({ data }) => {
    const matchesText =
      data.title.toLowerCase().includes(keyword) ||
      data.description.toLowerCase().includes(keyword);

    const matchesTag =
      tag === "all" || (data.tags && data.tags.includes(tag));

    return matchesText && matchesTag;
  });

  // Sort
  if (sort === "recent") {
    renderList.sort((a, b) => b.data.timestamp?.seconds - a.data.timestamp?.seconds);
  }

  // Future: sort === "liked" (based on likeCount)
  if (sort === "liked") {
    renderList.sort((a, b) => (b.data.likeCount || 0) - (a.data.likeCount || 0));
  }

  renderList.forEach(({ id, data, type }) => {
    renderCard(type, id, data);
  });
}

function renderCard(collectionName, docId, data) {
  const containerId = collectionName === "trending" ? "trending-content" : "traditional-content";
  const container = document.getElementById(containerId);

  const card = document.createElement("div");
  card.classList.add("content-card");
  card.dataset.id = docId;

  const tagsDisplay = data.tags ? data.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ') : '';

  card.innerHTML = `
    <h3>${data.title}</h3>
    <p>${data.description}</p>
    <video src="${data.videoURL}" controls></video>
    <div class="tags">${tagsDisplay}</div>
    <button class="bookmark-btn" data-id="${docId}">🔖 Bookmark</button>

    <div class="comment-section">
      <input type="text" class="comment-input" placeholder="Add a comment" />
      <button class="comment-btn">Post</button>
      <div class="comments-list"></div>
    </div>
  `;

  container.appendChild(card);

  // Comments
  const commentBtn = card.querySelector(".comment-btn");
  commentBtn.addEventListener("click", () => {
    addComment(collectionName, docId, card);
  });

  loadComments(collectionName, docId, card);
}

// Comments remain unchanged...
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

document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("delete-comment")) {
    const commentId = e.target.dataset.id;
    const contentId = e.target.dataset.contentId;
    const type = e.target.dataset.type;

    await deleteDoc(doc(db, `${type}/${contentId}/comments/${commentId}`));
  }
});
