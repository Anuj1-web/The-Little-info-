export function showToast(message, type = "info") {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerText = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

export function showModal(message, onConfirm) {
  const modal = document.getElementById('confirmationModal');
  modal.querySelector('.modal-message').innerText = message;
  modal.style.display = "block";

  const confirmBtn = modal.querySelector('.confirm');
  const cancelBtn = modal.querySelector('.cancel');

  confirmBtn.onclick = () => {
    onConfirm();
    modal.style.display = "none";
  };
  cancelBtn.onclick = () => modal.style.display = "none";
}

export function closeModal() {
  document.getElementById('confirmationModal').style.display = "none";
}
