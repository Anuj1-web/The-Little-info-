// settings.js
document.addEventListener('DOMContentLoaded', () => {
  const auth = firebase.auth();
  const form = document.getElementById('passwordUpdateForm');
  const toastContainer = document.getElementById('toast-container');

  // Show toast message
  function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'error' : 'success'}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  // Handle logout (if needed)
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      auth.signOut().then(() => {
        showToast('Logged out');
        location.href = 'login.html';
      });
    });
  }

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = form.email.value.trim();
    const newPassword = form.newPassword.value.trim();

    if (!email || !newPassword) {
      return showToast('Please fill in both fields.', true);
    }

    try {
      const user = auth.currentUser;

      if (!user) {
        return showToast('You must be logged in to update password.', true);
      }

      if (user.email !== email) {
        return showToast('Entered email does not match your account.', true);
      }

      await user.sendEmailVerification();
      showToast('Verification email sent. Please verify before updating.');

      // Watch for email verification
      const checkVerified = setInterval(async () => {
        await user.reload();
        if (user.emailVerified) {
          clearInterval(checkVerified);
          await user.updatePassword(newPassword);
          showToast('Password updated successfully.');
        }
      }, 3000); // check every 3 seconds

    } catch (error) {
      console.error(error);
      showToast(error.message || 'Error updating password.', true);
    }
  });
});
