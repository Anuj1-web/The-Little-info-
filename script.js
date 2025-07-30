// Firebase Initialization (Make sure firebase.js is imported before this script)
import { db } from './firebase.js';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-lite.js';

// DOM Elements
const trendingSection = document.getElementById('trending-content');
const traditionalSection = document.getElementById('traditional-content');

// Utility to create a content card
function createContentCard(doc) {
  const data = doc.data();
  const card = document.createElement('div');
  card.classList.add('content-card');

  card.innerHTML = `
    <h3>${data.title || 'Untitled'}</h3>
    <p>${data.description || 'No description available.'}</p>
  `;
  return card;
}

// Load content by category
async function loadContentByCategory(category, container) {
  try {
    const q = query(
      collection(db, 'content'),
      where('category', '==', category),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      container.innerHTML = '<p>No content found in this category.</p>';
    } else {
      container.innerHTML = '';
      querySnapshot.forEach((doc) => {
        const card = createContentCard(doc);
        container.appendChild(card);
      });
    }
  } catch (error) {
    console.error(`Error loading ${category} content:`, error);
    container.innerHTML = '<p>Failed to load content. Try again later.</p>';
  }
}

// Initialize homepage content
function initHomePage() {
  if (trendingSection && traditionalSection) {
    loadContentByCategory('Trending', trendingSection);
    loadContentByCategory('Traditional', traditionalSection);
  }
}

// Navigation handler
function setupNavigation() {
  const loginBtn = document.getElementById('login-btn');
  const signupBtn = document.getElementById('signup-btn');
  const aboutLink = document.getElementById('about-link');
  const contactLink = document.getElementById('contact-link');

  if (loginBtn) loginBtn.addEventListener('click', () => window.location.href = 'login.html');
  if (signupBtn) signupBtn.addEventListener('click', () => window.location.href = 'signup.html');
  if (aboutLink) aboutLink.addEventListener('click', () => window.location.href = 'about.html');
  if (contactLink) contactLink.addEventListener('click', () => window.location.href = 'contact.html');
}

// Run on load
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  initHomePage();
});
