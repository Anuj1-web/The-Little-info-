const auth = firebase.auth();
const db = firebase.firestore();

const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const newPasswordInput = document.getElementById("newPassword");
const enable2FA = document.getElementById("enable2FA");
const roleInput = document.getElementById("role");

const verifyEmailBtn = document.getElementById("verifyEmail");
const settingsForm = document.getElementById("settingsForm");
const deleteAccountBtn = document.getElementById("deleteAccount");
const confirmModal = document.getElementById("confirmModal");
const cancelDelete = document.getElementById("cancelDelete");
const confirmDelete = document.getElementById("confirmDelete");

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    alert("You must be logged in.");
    window.location.href = "login.html";
    return;
  }

  const doc = await db.collection("users").doc(user.uid).get();
  const userData = doc.data();
  if (userData) {
    usernameInput.value = userData.username || "";
    emailInput.value = user.email;
    roleInput.value = userData.role || "user";
    enable2FA.checked = userData.twoStepEnabled || false;
  }

  verifyEmailBtn.onclick = () => {
    if (!user.emailVerified) {
      user.sendEmailVerification().then(() => {
        alert("Verification email sent.");
      });
    } else {
      alert("Email is already verified.");
    }
  };

  settingsForm.onsubmit = async (e) => {
    e.preventDefault();
    try {
      const username = usernameInput.value.trim();
      const email = emailInput.value.trim();
      const newPassword = newPasswordInput.value.trim();
      const twoStep = enable2FA.checked;

      if (email && email !== user.email) await user.updateEmail(email);
      if (newPassword) await user.updatePassword(newPassword);
      await db.collection("users").doc(user.uid).update({
        username,
        twoStepEnabled: twoStep
      });

      alert("Settings updated successfully.");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  deleteAccountBtn.onclick = () => confirmModal.classList.remove("hidden");
  cancelDelete.onclick = () => confirmModal.classList.add("hidden");

  confirmDelete.onclick = async () => {
    try {
      await db.collection("users").doc(user.uid).delete();
      await user.delete();
      alert("Account deleted.");
      window.location.href = "signup.html";
    } catch (err) {
      alert("Re-authentication may be required: " + err.message);
    }
  };
});
