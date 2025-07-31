// setting.js

document.addEventListener('DOMContentLoaded', () => {
  const themeSelect = document.getElementById('themePreference');
  const languageSelect = document.querySelector('select[name="language"]');
  const notificationsSelect = document.querySelector('select[name="notifications"]');
  const form = document.querySelector('.settings-form');

  // Load preferences
  if (localStorage.getItem('theme')) {
    themeSelect.value = localStorage.getItem('theme');
  }

  if (localStorage.getItem('language')) {
    languageSelect.value = localStorage.getItem('language');
  }

  if (localStorage.getItem('notifications')) {
    notificationsSelect.value = localStorage.getItem('notifications');
  }

  // Apply theme
  const applyTheme = (theme) => {
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  };

  // On theme change
  themeSelect.addEventListener('change', () => {
    const selectedTheme = themeSelect.value;
    if (selectedTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark ? 'dark' : 'light');
    } else {
      applyTheme(selectedTheme);
    }
  });

  // Save other preferences
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    localStorage.setItem('language', languageSelect.value);
    localStorage.setItem('notifications', notificationsSelect.value);

    alert('Settings saved successfully!');
  });
});
