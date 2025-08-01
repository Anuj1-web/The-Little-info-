// admin-dashboard.js

document.addEventListener("DOMContentLoaded", () => {
  const adminTopicsContainer = document.getElementById("adminTopicsContainer");
  const toastContainer = document.getElementById("toastContainer");

  firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
      showToast("Please log in to continue.", "error");
      setTimeout(() => window.location.href = "login.html", 1500);
      return;
    }

    const uid = user.uid;
    firebase.firestore().collection("users").doc(uid).get().then((doc) => {
      const userData = doc.data();
      if (userData && userData.role === "admin") {
        // Load admin dashboard data
        loadAdminTopics();
      } else {
        showToast("Access denied. Admins only.", "error");
        setTimeout(() => window.location.href = "dashboard.html", 1500);
      }
    }).catch((err) => {
      console.error("Error verifying admin role:", err);
      showToast("Something went wrong. Try again later.", "error");
      setTimeout(() => window.location.href = "dashboard.html", 2000);
    });
  });

  function loadAdminTopics() {
    firebase.firestore().collection("topics").orderBy("timestamp", "desc").get()
      .then((querySnapshot) => {
        adminTopicsContainer.innerHTML = "";
        if (querySnapshot.empty) {
          adminTopicsContainer.innerHTML = "<p>No uploaded topics yet.</p>";
          return;
        }

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const card = document.createElement("div");
          card.className = "topic-card fade-in";
          card.innerHTML = `
            <h3>${data.title || "Untitled"}</h3>
            <p><strong>Category:</strong> ${data.category || "Uncategorized"}</p>
            <p><strong>Uploaded:</strong> ${new Date(data.timestamp?.toDate()).toLocaleString()}</p>
          `;
          adminTopicsContainer.appendChild(card);
        });
      }).catch((err) => {
        console.error("Error loading topics:", err);
        showToast("Failed to load topics.", "error");
      });
  }

  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerText = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
});
