<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
  import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
  } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";

  const firebaseConfig = {
    apiKey: "AIzaSyCpoq_sjH_XLdJ1ZRc0ECFaglvXh3FIS5Q",
    authDomain: "the-little-info.firebaseapp.com",
    projectId: "the-little-info",
    storageBucket: "the-little-info.firebasestorage.app",
    messagingSenderId: "165711417682",
    appId: "1:165711417682:web:
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  // Make auth functions available globally
  window.auth = auth;
  window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
  window.signInWithEmailAndPassword = signInWithEmailAndPassword;
  window.signOut = signOut;
</script>
