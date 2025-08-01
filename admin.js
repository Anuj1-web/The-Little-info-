// admin.js

document.addEventListener("DOMContentLoaded", () => {
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
        // Admin stays on page
        console.log("Admin verified.");
        document.querySelector(".admin-panel").classList.remove("hidden");
      } else {
        showToast("Access denied. Admins only.", "error");
        setTimeout(() => window.location.href = "dashboard.html", 1500);
      }
    }).catch((err) => {
      console.error("Error checking admin role:", err);
      showToast("Something went wrong. Try again later.", "error");
      setTimeout(() => window.location.href = "dashboard.html", 2000);
    });
  });

  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerText = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
});
