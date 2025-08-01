// admin.js
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "./firebase.js";

const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists() && userSnap.data().role === "admin") {
      console.log("✅ Admin access granted.");
      // Continue loading the admin page
    } else {
      alert("❌ Access denied: Admins only.");
      window.location.href = "index.html";
    }
  } else {
    window.location.href = "login.html";
  }
});
