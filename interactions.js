import { db, auth } from "./firebaseInit.js";
import {
  doc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Like a post
window.likePost = async function (postId) {
  const user = auth.currentUser;
  if (!user) return alert("⚠️ Login to like posts.");

  const likeRef = doc(db, "likes", `${postId}_${user.uid}`);
  await setDoc(likeRef, {
    postId,
    userId: user.uid,
    timestamp: serverTimestamp()
  });
  alert("👍 Post liked!");
};

// Bookmark a post
window.bookmarkPost = async function (postId) {
  const user = auth.currentUser;
  if (!user) return alert("⚠️ Login to bookmark.");

  const bookmarkRef = doc(db, `bookmarks/${user.uid}/posts`, postId);
  await setDoc(bookmarkRef, {
    postId,
    timestamp: serverTimestamp()
  });
  alert("🔖 Post bookmarked!");
};

// Post a comment
window.postComment = async function (postId) {
  const user = auth.currentUser;
  const input = document.getElementById(`comment-${postId}`);
  if (!user) return alert("⚠️ Login to comment.");
  if (!input.value.trim()) return;

  const commentRef = collection(db, `comments/${postId}/userComments`);
  await addDoc(commentRef, {
    text: input.value,
    userId: user.uid,
    timestamp: serverTimestamp()
  });
  input.value = "";
  alert("💬 Comment posted!");
};
