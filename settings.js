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

  // Load existing user data
  const doc = await db.collection("users").doc(user.uid).get();
  const userData = doc.data();
  if (userData) {
    usernameInput.value = userData.username || "";
    emailInput.value = user.email;
    roleInput.value = userData.role || "user";
    enable2FA.checked = userData.twoStepEnabled || false;
  }

  // Manual email verification button
  verifyEmailBtn.onclick = () => {
    if (!user.emailVerified) {
      user.sendEmailVerification()
        .then(() => alert("Verification email sent."))
        .catch((e) => alert("Error: " + e.message));
    } else {
      alert("Email is already verified.");
    }
  };

  // Update form
  settingsForm.onsubmit = async (e) => {
    e.preventDefault();
    const newUsername = usernameInput.value.trim();
    const newEmail = emailInput.value.trim();
    const newPassword = newPasswordInput.value.trim();
    const twoStepEnabled = enable2FA.checked;

    const updates = {};
    let needEmailVerification = false;

    try {
      // Username (in Firestore only)
      if (newUsername && newUsername !== userData.username) {
        updates.username = newUsername;
      }

      // Email change
      if (newEmail && newEmail !== user.email) {
        await user.updateEmail(newEmail);
        needEmailVerification = true;
      }

      // Password change
      if (newPassword.length > 5) {
        await user.updatePassword(newPassword);
        needEmailVerification = true;
      }

      // 2FA toggle (in Firestore only)
      updates.twoStepEnabled = twoStepEnabled;

      // Apply Firestore updates
      await db.collection("users").doc(user.uid).update(updates);

      // Send verification only if email or password changed
      if (needEmailVerification) {
        await user.sendEmailVerification();
        alert("Changes saved. Please check your inbox to verify email.");
      } else {
        alert("Changes saved successfully.");
      }

    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // Account deletion
  deleteAccountBtn.onclick = () => confirmModal.classList.remove("hidden");
  cancelDelete.onclick = () => confirmModal.classList.add("hidden");

  confirmDelete.onclick = async () => {
    try {
      await db.collection("users").doc(user.uid).delete();
      await user.delete();
      alert("Account deleted.");
      window.location.href = "signup.html";
    } catch (err) {
      alert("Error: " + err.message);
    }
  };
});
