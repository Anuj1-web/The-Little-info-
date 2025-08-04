// firebase.js

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCpoq_sjH_XLdJ1ZRc0ECFaglvXh3FIS5Q",
  authDomain: "the-little-info.firebaseapp.com",
  projectId: "the-little-info",
  storageBucket: "the-little-info.appspot.com",
  messagingSenderId: "165711417682",
  appId: "1:165711417682:web:cebb205d7d5c1f18802a8b"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Optional: Initialize services globally if needed
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Optional: attach to window for global access if needed
window.firebaseAuth = auth;
window.firebaseDB = db;
window.firebaseStorage = storage;
