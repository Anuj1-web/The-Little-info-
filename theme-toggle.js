// theme-toggle.js

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('themeToggle');
  const htmlElement = document.documentElement;

  // Load saved theme from localStorage
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme === 'light') {
    htmlElement.setAttribute('data-theme', 'light');
    toggleBtn.textContent = '🌙';
  } else {
    htmlElement.setAttribute('data-theme', 'dark');
    toggleBtn.textContent = '☀️';
  }

  // Toggle theme on button click
  toggleBtn.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    // Update toggle icon
    toggleBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
  });
});
