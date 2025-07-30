import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getFirestore, collection, getDocs, query, where, orderBy, addDoc, doc, updateDoc, deleteDoc, onSnapshot, limit, getDoc
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import {
  getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCpoq_sjH_XLdJ1ZRc0ECFaglvXh3FIS5Q",
  authDomain: "the-little-info.firebaseapp.com",
  projectId: "the-little-info",
  storageBucket: "the-little-info.appspot.com",
  messagingSenderId: "165711417682",
  appId: "1:165711417682:web:cebb205d7d5c1f18802a8b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

let currentUser;

// ======================= Auth Listener =======================
onAuthStateChanged(auth, user => {
  currentUser = user;
  if (user) {
    loadNotifications(user.uid);
  }
});

// =================== Content Display ===================
async function loadContent() {
  const trendingQuery = query(collection(db, "content"), where("type", "==", "trending"), orderBy("timestamp", "desc"));
  const traditionalQuery = query(collection(db, "content"), where("type", "==", "traditional"), orderBy("timestamp", "desc"));

  const trendingSnap = await getDocs(trendingQuery);
  const traditionalSnap = await getDocs(traditionalQuery);

  displayContent(trendingSnap.docs, "trending-content");
  displayContent(traditionalSnap.docs, "traditional-content");
}

function displayContent(docs, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  docs.forEach(docSnap => {
    const data = docSnap.data();
    const card = document.createElement("div");
    card.className = "content-card";
    card.innerHTML = `
      <video src="${data.videoUrl}" controls></video>
      <h3>${data.title}</h3>
      <p>${data.description}</p>
      <p><strong>Tag:</strong> ${data.tag || 'General'}</p>
      <button class="bookmark-btn" data-id="${docSnap.id}">🔖</button>
      <button class="comment-btn" data-id="${docSnap.id}">💬</button>
    `;
    container.appendChild(card);
  });
}

// =================== Bookmark Function ===================
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("bookmark-btn")) {
    if (!currentUser) return alert("Login required");

    const contentId = e.target.dataset.id;
    await addDoc(collection(db, "bookmarks"), {
      uid: currentUser.uid,
      contentId
    });
    alert("Bookmarked!");
  }
});

// =================== Comment System ===================
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("comment-btn")) {
    const comment = prompt("Enter your comment:");
    if (!comment || !currentUser) return;

    const contentId = e.target.dataset.id;
    await addDoc(collection(db, "comments"), {
      uid: currentUser.uid,
      contentId,
      text: comment,
      timestamp: new Date()
    });
    alert("Comment added!");
  }
});

// =================== Tag Filter & Sorting ===================
document.getElementById("tag-filter").addEventListener("change", updateFilteredContent);
document.getElementById("sort-by").addEventListener("change", updateFilteredContent);

async function updateFilteredContent() {
  const tag = document.getElementById("tag-filter").value;
  const sort = document.getElementById("sort-by").value;

  let q = collection(db, "content");

  if (tag !== "all") q = query(q, where("tag", "==", tag));
  if (sort === "most_recent") q = query(q, orderBy("timestamp", "desc"));
  else if (sort === "most_liked") q = query(q, orderBy("likes", "desc"));

  const docsSnap = await getDocs(q);
  displayContent(docsSnap.docs, "trending-content");
}

// =================== Playlist Management ===================
async function createPlaylist(name, isPublic = false) {
  const docRef = await addDoc(collection(db, "playlists"), {
    uid: currentUser.uid,
    name,
    isPublic,
    videos: [],
    timestamp: new Date()
  });

  if (isPublic) {
    await setDoc(doc(db, "public_playlists", docRef.id), {
      ...docRef.data(),
      publicId: docRef.id
    });
  }

  alert("Playlist created");
}

// =================== Notifications ===================
const notifContainer = document.getElementById("notif-dropdown");
const notifCounter = document.getElementById("notif-counter");
const clearNotifBtn = document.getElementById("clear-notif");

function loadNotifications(uid) {
  const notifRef = query(
    collection(db, "notifications"),
    where("uid", "==", uid),
    orderBy("timestamp", "desc"),
    limit(10)
  );

  onSnapshot(notifRef, (snapshot) => {
    notifContainer.innerHTML = "";
    notifCounter.innerText = snapshot.size;

    snapshot.forEach(doc => {
      const data = doc.data();
      const div = document.createElement("div");
      div.className = "notif-item";
      div.innerHTML = `
        ${data.type === "like" ? "❤️" : "💬"} ${data.message}
        <button data-id="${doc.id}" class="delete-notif">🗑️</button>
      `;
      notifContainer.appendChild(div);
    });
  });
}

notifContainer.addEventListener("click", async (e) => {
  if (e.target.classList.contains("delete-notif")) {
    const id = e.target.dataset.id;
    await deleteDoc(doc(db, "notifications", id));
  }
});

clearNotifBtn.addEventListener("click", async () => {
  const q = query(collection(db, "notifications"), where("uid", "==", currentUser.uid));
  const snap = await getDocs(q);
  snap.forEach(doc => deleteDoc(doc.ref));
});

// =================== Video Speed Control ===================
document.addEventListener("change", (e) => {
  if (e.target.classList.contains("speed-control")) {
    const video = e.target.closest(".content-card").querySelector("video");
    video.playbackRate = parseFloat(e.target.value);
  }
});

// =================== On Load ===================
window.onload = () => {
  loadContent();
};
