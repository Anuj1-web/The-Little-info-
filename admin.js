import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { app } from "./firebase.js";

const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  try {
    const adminQuery = query(
      collection(db, "users"),
      where("email", "==", user.email),
      where("role", "==", "Admin")
    );

    const querySnapshot = await getDocs(adminQuery);

    if (!querySnapshot.empty) {
      console.log("✅ Admin access granted:", user.email);
      // Admin is authenticated, continue loading admin dashboard
    } else {
      alert("❌ Access denied: Admins only.");
      window.location.href = "index.html";
    }
  } catch (error) {
    console.error("Error verifying admin:", error);
    alert("Something went wrong while verifying admin access.");
    window.location.href = "index.html";
  }
});
