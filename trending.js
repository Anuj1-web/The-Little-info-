document.addEventListener("DOMContentLoaded", () => {
  const topicsContainer = document.getElementById("topicsContainer");

  // Firebase initialization (must already be included in your base)
  const firebaseConfig = {
  apiKey: "AIzaSyCpoq_sjH_XLdJ1ZRc0ECFaglvXh3FIS5Q",
  authDomain: "the-little-info.firebaseapp.com",
  projectId: "the-little-info",
  storageBucket: "the-little-info.firebasestorage.app",
  messagingSenderId: "165711417682",
  appId: "1:165711417682:web:cebb205d7d5c1f18802a8b"
};

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  const db = firebase.firestore();

  function loadTrendingTopics() {
    db.collection("topics")
      .where("category", "==", "trending")
      .get()
      .then((querySnapshot) => {
        topicsContainer.innerHTML = "";
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const topicCard = document.createElement("div");
          topicCard.className = "topic-card animated";
          topicCard.innerHTML = `
            <h3>${data.title}</h3>
            <p>${data.description}</p>
          `;
          topicsContainer.appendChild(topicCard);
        });
      })
      .catch((error) => {
        console.error("Error loading trending topics:", error);
      });
  }

  loadTrendingTopics();
});
