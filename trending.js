// trending.js

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("trendingContainer");

  if (!firebase?.firestore) {
    console.error("Firebase not initialized correctly.");
    return;
  }

  const db = firebase.firestore();

  try {
    const snapshot = await db.collection("topics").where("category", "==", "trending").get();
    if (snapshot.empty) {
      container.innerHTML = `<p>No trending topics found.</p>`;
      return;
    }

    snapshot.forEach(doc => {
      const data = doc.data();
      const card = document.createElement("div");
      card.className = "topic-card fade-in";
      card.innerHTML = `
        <h3>${data.title || "Untitled Topic"}</h3>
        <p>${data.description || "No description available."}</p>
        <span class="badge">🔥 Trending</span>
      `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading trending topics:", error);
    container.innerHTML = `<p class="error">Error loading trending topics.</p>`;
  }
});
