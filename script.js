import { db, auth } from './firebase.js';
import {
  collection,
  getDocs,
  query
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const trendingSection = document.getElementById("trending-content");
const traditionalSection = document.getElementById("traditional-content");
const searchInput = document.getElementById("searchInput");
const tagFilter = document.getElementById("tagFilter");
const sortOption = document.getElementById("sortOption");

async function fetchContent() {
  const q = query(collection(db, "content"));
  const querySnapshot = await getDocs(q);
  let contentArray = [];

  querySnapshot.forEach((doc) => {
    contentArray.push({ id: doc.id, ...doc.data() });
  });

  renderContent(contentArray);
}

function renderContent(data) {
  trendingSection.innerHTML = "";
  traditionalSection.innerHTML = "";

  let filteredData = data.filter(item => {
    const keywordMatch =
      item.title.toLowerCase().includes(searchInput.value.toLowerCase()) ||
      item.description.toLowerCase().includes(searchInput.value.toLowerCase());

    const tagMatch =
      tagFilter.value === "All" || item.tags?.includes(tagFilter.value);

    return keywordMatch && tagMatch;
  });

  if (sortOption.value === "likes") {
    filteredData.sort((a, b) => (b.likes || 0) - (a.likes || 0));
  } else {
    filteredData.sort((a, b) => b.timestamp - a.timestamp);
  }

  filteredData.forEach((item) => {
    const container = item.category === "Trending" ? trendingSection : traditionalSection;
    container.appendChild(createContentCard(item));
  });
}

function createContentCard(item) {
  const card = document.createElement("div");
  card.className = "content-card";

  const defaultQuality = "720p";
  const currentSrc = item.videoUrls?.[defaultQuality] || Object.values(item.videoUrls || {})[0];

  const subtitleTracks = Object.entries(item.subtitles || {})
    .map(([lang, url]) =>
      `<track label="${lang.toUpperCase()}" kind="subtitles" srclang="${lang}" src="${url}">`
    ).join('');

  const subtitleOptions = Object.keys(item.subtitles || {})
    .map(lang =>
      `<option value="${lang}">${lang.toUpperCase()}</option>`
    ).join('');

  card.innerHTML = `
    <h3>${item.title}</h3>
    <div class="video-wrapper">
      <video controls class="video-player" crossorigin="anonymous">
        <source src="${currentSrc}" type="video/mp4">
        ${subtitleTracks}
      </video>
    </div>

    <div class="video-controls">
      <label>Speed:
        <select class="speed-control">
          <option value="0.5">0.5x</option>
          <option value="1" selected>1x</option>
          <option value="1.5">1.5x</option>
          <option value="2">2x</option>
        </select>
      </label>

      <label>Quality:
        <select class="quality-control">
          ${Object.keys(item.videoUrls || {}).map(q => `
            <option value="${q}" ${q === defaultQuality ? "selected" : ""}>${q}</option>
          `).join('')}
        </select>
      </label>

      ${subtitleOptions ? `
      <label>Subtitles:
        <select class="subtitle-control">
          <option value="">None</option>
          ${subtitleOptions}
        </select>
      </label>` : ""}
    </div>

    <p>${item.description}</p>
    <div class="tags">Tags: ${item.tags?.join(", ") || "None"}</div>
    <button class="bookmark-btn" data-id="${item.id}">🔖 Bookmark</button>

    <div class="comment-section">
      <textarea placeholder="Add a comment..." data-id="${item.id}" class="comment-input"></textarea>
      <button class="submit-comment" data-id="${item.id}">Comment</button>
      <div class="comments" id="comments-${item.id}"></div>
    </div>
  `;

  const video = card.querySelector("video");

  // Speed control
  const speedControl = card.querySelector(".speed-control");
  speedControl.addEventListener("change", () => {
    video.playbackRate = parseFloat(speedControl.value);
  });

  // Quality control
  const qualityControl = card.querySelector(".quality-control");
  qualityControl.addEventListener("change", () => {
    const selectedQuality = qualityControl.value;
    const newSrc = item.videoUrls[selectedQuality];
    const currentTime = video.currentTime;
    const isPlaying = !video.paused;
    video.src = newSrc;
    video.load();
    video.currentTime = currentTime;
    if (isPlaying) video.play();
  });

  // Subtitle language selector
  const subtitleSelector = card.querySelector(".subtitle-control");
  if (subtitleSelector) {
    subtitleSelector.addEventListener("change", () => {
      const selectedLang = subtitleSelector.value;
      Array.from(video.textTracks).forEach(track => {
        track.mode = track.language === selectedLang ? "showing" : "disabled";
      });
    });
  }

  return card;
}

// Filters & Events
searchInput.addEventListener("input", fetchContent);
tagFilter.addEventListener("change", fetchContent);
sortOption.addEventListener("change", fetchContent);

fetchContent();
