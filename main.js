// main.js

// ==== Theme Toggle ====
const toggleSwitch = document.getElementById('themeToggle');

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  toggleSwitch.checked = theme === 'dark';
}

function toggleTheme() {
  const currentTheme = localStorage.getItem('theme') || 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
}

toggleSwitch?.addEventListener('change', toggleTheme);

// Load saved theme on page load
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);
});

// ==== Smooth Scroll & Animation (Optional) ====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ==== Scroll Animations (using Intersection Observer) ====
const animatedItems = document.querySelectorAll('.animate-on-scroll');
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);

animatedItems.forEach(item => observer.observe(item));

// ==== Navigation Menu Toggle (Optional for mobile) ====
const menuBtn = document.querySelector('#menuToggle');
const navMenu = document.querySelector('.nav-menu');

menuBtn?.addEventListener('click', () => {
  navMenu.classList.toggle('open');
});

// ==== Optional: Logo Redirect Home ====
const logo = document.querySelector('.site-logo');
logo?.addEventListener('click', () => {
  window.location.href = 'index.html';
});
