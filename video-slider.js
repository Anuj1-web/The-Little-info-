let currentSlide = 0;
let videos = [];

async function fetchLatestVideos() {
  try {
    const response = await fetch('/api/videos/latest');
    const data = await response.json();
    videos = data.slice(0, 5); // only take the latest 5

    renderSlides();
    updateDots();
    showSlide(currentSlide);
  } catch (error) {
    console.error('Failed to fetch videos:', error);
  }
}

function renderSlides() {
  const slider = document.getElementById('videoSlider');
  slider.innerHTML = '';

  videos.forEach((video, index) => {
    const slide = document.createElement('div');
    slide.classList.add('slide');
    if (index === 0) slide.classList.add('active');

    slide.innerHTML = `
      <video controls src="${video.filePath}" title="${video.title}"></video>
      <div class="video-title">${video.title}</div>
    `;
    slider.appendChild(slide);
  });
}

function updateDots() {
  const dotsContainer = document.getElementById('sliderDots');
  dotsContainer.innerHTML = '';

  videos.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => showSlide(i));
    dotsContainer.appendChild(dot);
  });
}

function showSlide(index) {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');

  slides.forEach(slide => slide.classList.remove('active'));
  dots.forEach(dot => dot.classList.remove('active'));

  slides[index].classList.add('active');
  dots[index].classList.add('active');
  currentSlide = index;
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % videos.length;
  showSlide(currentSlide);
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + videos.length) % videos.length;
  showSlide(currentSlide);
}

document.addEventListener('DOMContentLoaded', fetchLatestVideos);
