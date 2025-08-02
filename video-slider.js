// video-slider.js
import { getFirestore, collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "./firebase-config.js"; // adjust if your config file is named differently

const videoWrapper = document.getElementById("videoSliderWrapper");

async function loadLatestVideos() {
  const q = query(collection(db, "videos"), orderBy("uploadedAt", "desc"), limit(5));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const slide = document.createElement("div");
    slide.className = "swiper-slide";
    slide.innerHTML = `
      <video controls poster="${data.thumbnail || ''}" title="${data.title}">
        <source src="${data.videoUrl}" type="video/mp4">
        Your browser does not support the video tag.
      </video>
    `;
    videoWrapper.appendChild(slide);
  });

  new Swiper(".mySwiper", {
    slidesPerView: 1,
    loop: true,
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev"
    }
  });
}

loadLatestVideos();
