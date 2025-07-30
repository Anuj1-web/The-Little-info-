import {
  getAuth, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, collection, query, orderBy, getDocs, doc, setDoc, getDoc, updateDoc, addDoc, deleteDoc, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getStorage, ref, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCpoq_sjH_XLdJ1ZRc0ECFaglvXh3FIS5Q",
  authDomain: "the-little-info.firebaseapp.com",
  projectId: "the-little-info",
  storageBucket: "the-little-info.appspot.com",
  messagingSenderId: "165711417682",
  appId: "1:165711417682:web:cebb205d7d5c1f18802a8b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ------------------ ON LOAD -----------------
onAuthStateChanged(auth, async (user) => {
  if (user) {
    loadContent(user);
    loadNotifications(user);
  }
});

// ------------------ LOAD CONTENT -----------------
async function loadContent(user) {
  const contentRef = collection(db, "content");
  const q = query(contentRef, orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);
  const container = document.getElementById("contentContainer");

  container.innerHTML = "";
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const card = generateContentCard(docSnap.id, data, user);
    container.appendChild(card);
  });
}

// ------------------ GENERATE CONTENT CARD -----------------
function generateContentCard(id, data, user) {
  const card = document.createElement("div");
  card.className = "content-card";

  card.innerHTML = `
    <video src="${data.videoUrl}" controls class="video-player"></video>
    <h3>${data.title}</h3>
    <p>${data.description}</p>
    <div class="tags">${(data.tags || []).map(tag => `<span class="tag">${tag}</span>`).join(' ')}</div>
    <div class="actions">
      <button onclick="toggleBookmark('${id}')">🔖</button>
      <button onclick="likeContent('${id}')">❤️ ${data.likes || 0}</button>
      <button onclick="toggleComments('${id}')">💬</button>
      <button onclick="showSummaryModal('${id}')">📄 Summary</button>
      <button onclick="addToPlaylist('${id}', '${data.title}')">➕ Playlist</button>
    </div>
    <div class="comments" id="comments-${id}" style="display:none;"></div>
  `;
  return card;
}

// ------------------ BOOKMARK -----------------
async function toggleBookmark(contentId) {
  const user = auth.currentUser;
  if (!user) return;

  const bookmarkRef = doc(db, "users", user.uid, "bookmarks", contentId);
  const snap = await getDoc(bookmarkRef);
  if (snap.exists()) {
    await deleteDoc(bookmarkRef);
  } else {
    await setDoc(bookmarkRef, { timestamp: Date.now() });
  }
}

// ------------------ LIKE -----------------
async function likeContent(contentId) {
  const contentRef = doc(db, "content", contentId);
  const snap = await getDoc(contentRef);
  if (!snap.exists()) return;

  const likes = (snap.data().likes || 0) + 1;
  await updateDoc(contentRef, { likes });
  await addNotification(snap.data().ownerId, "❤️ Your video got a new like!");
}

// ------------------ COMMENTS -----------------
async function toggleComments(contentId) {
  const commentBox = document.getElementById(`comments-${contentId}`);
  commentBox.style.display = commentBox.style.display === "none" ? "block" : "none";
  commentBox.innerHTML = `<textarea placeholder="Add comment"></textarea><button onclick="submitComment('${contentId}')">Submit</button>`;
}

async function submitComment(contentId) {
  const user = auth.currentUser;
  const text = document.querySelector(`#comments-${contentId} textarea`).value;
  if (!text) return;

  await addDoc(collection(db, "content", contentId, "comments"), {
    userId: user.uid,
    text,
    timestamp: Date.now()
  });

  const contentSnap = await getDoc(doc(db, "content", contentId));
  await addNotification(contentSnap.data().ownerId, "💬 You received a new comment!");
}

// ------------------ ADD TO PLAYLIST -----------------
function addToPlaylist(contentId, title) {
  // Logic opens a modal that calls createPlaylist or addToExisting
}

// ------------------ SHOW SUMMARY -----------------
async function showSummaryModal(contentId) {
  const summaryModal = document.getElementById("summaryModal");
  const summaryContent = document.getElementById("summaryContent");

  const summaryRef = doc(db, "summaries", contentId);
  const snap = await getDoc(summaryRef);
  if (snap.exists()) {
    summaryContent.innerText = snap.data().text;
  } else {
    summaryContent.innerText = "Generating summary...";
    const res = await fetch(`/generate-summary?contentId=${contentId}`);
    const data = await res.json();
    summaryContent.innerText = data.summary;
    await setDoc(summaryRef, { text: data.summary, timestamp: Date.now() });
  }

  summaryModal.style.display = "block";
}

function closeSummaryModal() {
  document.getElementById("summaryModal").style.display = "none";
}

// ------------------ NOTIFICATIONS -----------------
async function addNotification(userId, message) {
  if (!userId) return;
  await addDoc(collection(db, "users", userId, "notifications"), {
    message,
    timestamp: Date.now(),
    read: false
  });
}

function loadNotifications(user) {
  const notifBtn = document.getElementById("notifBtn");
  const notifDropdown = document.getElementById("notifDropdown");

  onSnapshot(collection(db, "users", user.uid, "notifications"), (snapshot) => {
    notifDropdown.innerHTML = "";
    snapshot.docs
      .sort((a, b) => b.data().timestamp - a.data().timestamp)
      .forEach(doc => {
        const div = document.createElement("div");
        div.className = "notif";
        div.innerText = doc.data().message;
        notifDropdown.appendChild(div);
      });
  });
}

async function clearAllNotifications() {
  const user = auth.currentUser;
  const q = await getDocs(collection(db, "users", user.uid, "notifications"));
  q.forEach(async docSnap => {
    await deleteDoc(doc(db, "users", user.uid, "notifications", docSnap.id));
  });
}

// ------------------ DARK MODE SUPPORT -----------------
document.getElementById("themeToggle")?.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

window.showSummaryModal = showSummaryModal;
window.closeSummaryModal = closeSummaryModal;
window.toggleBookmark = toggleBookmark;
window.likeContent = likeContent;
window.toggleComments = toggleComments;
window.submitComment = submitComment;
window.clearAllNotifications = clearAllNotifications;
