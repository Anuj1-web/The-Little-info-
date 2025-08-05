// trending.js

document.addEventListener("DOMContentLoaded", () => {
  const trendingContainer = document.getElementById("trendingTopics");

  const db = firebase.firestore();

  db.collection("topics").where("category", "==", "trending").get()
    .then(snapshot => {
      trendingContainer.innerHTML = ""; // Clear any loading text

      if (snapshot.empty) {
        trendingContainer.innerHTML = "<p>No trending topics found.</p>";
        return;
      }

      snapshot.forEach(doc => {
        const data = doc.data();
        const card = document.createElement("div");
        card.className = "topic-card fade-in";

        let contentHTML = `
          <h3>${data.title || "Untitled"}</h3>
          <p>${data.description || ""}</p>
        `;

        // If videoUrl is present, embed video player
        if (data.videoUrl) {
          contentHTML += `
            <video controls width="100%" poster="${data.imageUrl || ''}">
              <source src="${data.videoUrl}" type="video/mp4">
              Your browser does not support the video tag.
            </video>
          `;
        } else if (data.imageUrl) {
          // Fallback to image
          contentHTML += `<img src="${data.imageUrl}" alt="Thumbnail" style="width:100%; border-radius:10px;" />`;
        }

        card.innerHTML = contentHTML;
        trendingContainer.appendChild(card);
      });
    })
    .catch(error => {
      console.error("Error fetching trending topics:", error);
      trendingContainer.innerHTML = "<p>Error loading content. Try again later.</p>";
    });
});
