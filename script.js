import { db, auth } from "./firebase.js";
import {
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  where
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-lite.js";

let allContent = [];

const trendingContainer = document.getElementById("trending-content");
const traditionalContainer = document.getElementById("traditional-content");

const searchInput = document.getElementById("search-input");
const filterSelect = document.getElementById("filter-select");
const tagSelect = document.getElementById("tag-select");
const sortSelect = document.getElementById("sort-select");

async function fetchContent() {
  const colRef = collection(db, "content");
  const q = query(colRef, orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);

  allContent = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  renderContent();
}

function renderContent() {
  trendingContainer.innerHTML = "";
  traditionalContainer.innerHTML = "";

  const searchQuery = searchInput.value.toLowerCase();
  const selectedFilter = filterSelect.value;
  const selectedTag = tagSelect.value;
  const sortType = sortSelect.value;

  let filtered = allContent.filter(item => {
    const matchSearch =
      item.title.toLowerCase().includes(searchQuery) ||
      item.description.toLowerCase().includes(searchQuery);
    const matchFilter =
      selectedFilter === "all" || item.category === selectedFilter;
    const matchTag = selectedTag === "all" || item.tags?.includes(selectedTag);
    return matchSearch && matchFilter && matchTag;
  });

  // Sorting
  filtered.sort((a, b) => {
    if (sortType === "likes") return (b.likes || 0) - (a.likes || 0);
    else return b.timestamp - a.timestamp;
  });

  filtered.forEach(item => {
    const card = createContentCard(item);
    if (item.category === "trending") {
      trendingContainer.appendChild(card);
    } else if (item.category === "traditional") {
      traditionalContainer.appendChild(card);
    }
  });
}

function createContentCard(data) {
  const card = document.createElement("div");
  card.className = "content-card";

  card.innerHTML = `
    <h3>${data.title}</h3>
    <p>${data.description}</p>
    <video src="${data.videoUrl}" controls></video>
    <button class="bookmark-btn" data-id="${data.id}">Bookmark</button>

    <div class="comment-section">
      <input class="comment-input" placeholder="Write a comment..." />
      <button class="comment-btn" data-id="${data.id}">Post</button>
      <div class="comments-list" id="comments-${data.id}"></div>
    </div>
  `;

  // Bookmark functionality
  card.querySelector(".bookmark-btn").addEventListener("click", async () => {
    const user = auth.currentUser;
    if (user) {
      const bookmarkRef = collection(db, "users", user.uid, "bookmarks");
      await addDoc(bookmarkRef, {
        contentId: data.id,
        timestamp: Date.now()
      });
      alert("Bookmarked!");
    } else {
      alert("Please login to bookmark");
    }
  });

  // Post Comment
  card.querySelector(".comment-btn").addEventListener("click", async () => {
    const commentInput = card.querySelector(".comment-input");
    const text = commentInput.value.trim();
    const user = auth.currentUser;
    if (text && user) {
      const commentRef = collection(db, "content", data.id, "comments");
      await addDoc(commentRef, {
        text,
        userId: user.uid,
        timestamp: Date.now()
      });
      commentInput.value = "";
      loadComments(data.id);
    }
  });

  loadComments(data.id, card.querySelector(`#comments-${data.id}`));

  return card;
}

async function loadComments(contentId, container = null) {
  const commentRef = collection(db, "content", contentId, "comments");
  const snapshot = await getDocs(query(commentRef, orderBy("timestamp", "desc")));
  const list = container || document.getElementById(`comments-${contentId}`);
  list.innerHTML = "";

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const commentEl = document.createElement("div");
    commentEl.className = "comment";
    commentEl.innerHTML = `
      <p>${data.text}</p>
      <button class="delete-comment" data-id="${docSnap.id}" data-content="${contentId}">Delete</button>
    `;
    // Delete comment (admin or user who posted)
    commentEl.querySelector(".delete-comment").addEventListener("click", async () => {
      const user = auth.currentUser;
      if (!user) return alert("Login required");
      await deleteDoc(doc(db, "content", contentId, "comments", docSnap.id));
      loadComments(contentId);
    });

    list.appendChild(commentEl);
  });
}

// Listeners
searchInput.addEventListener("input", renderContent);
filterSelect.addEventListener("change", renderContent);
tagSelect.addEventListener("change", renderContent);
sortSelect.addEventListener("change", renderContent);

fetchContent();
